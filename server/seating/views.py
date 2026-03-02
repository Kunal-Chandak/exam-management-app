from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from accounts.permissions import IsOfficeInChargeOrAdmin
from .models import SeatingAssignment, SeatAssignment
from .serializers import SeatingAssignmentSerializer, SeatAssignmentSerializer
from subjects.models import Subject
from classrooms.models import Classroom
from teachers.models import Teacher
from students.models import Student
from departments.models import Department
from datetime import datetime

class SeatingViewSet(viewsets.ViewSet):
    permission_classes = [IsOfficeInChargeOrAdmin]

    def list(self, request):
        """List seating assignments with optional filtering by subject and/or classroom department"""
        try:
            subject_id = request.query_params.get('subject')
            dept_id = request.query_params.get('classroom_dept')
            
            print(f"[SEATING LIST] Query params - subject_id: {subject_id}, dept_id: {dept_id}")
            
            query = {}
            
            if subject_id:
                try:
                    subject = Subject.objects.get(id=subject_id)
                    query['subject'] = subject
                    print(f"[SEATING LIST] Found subject: {subject.name}")
                except Subject.DoesNotExist:
                    print(f"[SEATING LIST] Subject not found: {subject_id}")
                    return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Get all seatings matching the subject filter (if any)
            seatings = list(SeatingAssignment.objects(**query)) if query else list(SeatingAssignment.objects())
            print(f"[SEATING LIST] Initial seatings count: {len(seatings)}")
            
            # Filter by department in python (since MongoEngine doesn't support nested joins)
            if dept_id:
                try:
                    dept = Department.objects.get(id=dept_id)
                    print(f"[SEATING LIST] Found department: {dept.name} ({str(dept.id)})")
                    filtered_seatings = []
                    for s in seatings:
                        cls = getattr(s, 'classroom', None)
                        cls_id = str(cls.id) if cls else 'None'
                        dept_obj = getattr(cls, 'department', None) if cls else None
                        # derive possible department id representations
                        dept_obj_id = None
                        dept_obj_repr = 'None'
                        try:
                            if dept_obj:
                                # if department is a ReferenceField object
                                dept_obj_id = getattr(dept_obj, 'id', dept_obj)
                                dept_obj_repr = f"{getattr(dept_obj, 'name', str(dept_obj))} ({str(dept_obj_id)})"
                        except Exception:
                            dept_obj_id = str(dept_obj)
                            dept_obj_repr = str(dept_obj)

                        # perform robust comparisons
                        match = False
                        if dept_obj_id and str(dept_obj_id) == str(dept_id):
                            match = True
                        # also compare raw department object/string if above didn't match
                        if not match and dept_obj and str(dept_obj) == str(dept_id):
                            match = True

                        print(f"[SEATING LIST] Seating classroom: {cls_id}, classroom.dept: {dept_obj_repr}, match: {match}")
                        if match:
                            filtered_seatings.append(s)

                    seatings = filtered_seatings
                    print(f"[SEATING LIST] After dept filter - seatings count: {len(seatings)}")
                except Department.DoesNotExist:
                    print(f"[SEATING LIST] Department not found: {dept_id}")
                    return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)
            
            print(f"[SEATING LIST] Final seatings to serialize: {len(seatings)}")
            serializer = SeatingAssignmentSerializer(seatings, many=True)
            print(f"[SEATING LIST] Serialized data: {len(serializer.data)} items")
            return Response(serializer.data)
            
        except Exception as e:
            import traceback
            print(f"[SEATING LIST] ERROR: {str(e)}")
            traceback.print_exc()
            return Response(
                {'error': f'Error fetching seating: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request):
        serializer = SeatingAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            if 'subject' in data:
                data['subject'] = Subject.objects.get(id=data['subject'])
            if 'classroom' in data:
                data['classroom'] = Classroom.objects.get(id=data['classroom'])
            if 'supervisors' in data:
                data['supervisors'] = [Teacher.objects.get(id=s) for s in data['supervisors']]
            if 'students' in data:
                data['students'] = [Student.objects.get(id=s) for s in data['students']]
            data['created_at'] = datetime.utcnow().isoformat()
            data['updated_at'] = datetime.utcnow().isoformat()
            seating = SeatingAssignment(**data).save()
            return Response(SeatingAssignmentSerializer(seating).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            seating = SeatingAssignment.objects.get(id=pk)
            serializer = SeatingAssignmentSerializer(seating)
            return Response(serializer.data)
        except SeatingAssignment.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def update(self, request, pk=None):
        try:
            seating = SeatingAssignment.objects.get(id=pk)
            serializer = SeatingAssignmentSerializer(data=request.data)
            if serializer.is_valid():
                data = serializer.validated_data
                if 'subject' in data:
                    data['subject'] = Subject.objects.get(id=data['subject'])
                if 'classroom' in data:
                    data['classroom'] = Classroom.objects.get(id=data['classroom'])
                if 'supervisors' in data:
                    data['supervisors'] = [Teacher.objects.get(id=s) for s in data['supervisors']]
                if 'students' in data:
                    data['students'] = [Student.objects.get(id=s) for s in data['students']]
                data['updated_at'] = datetime.utcnow().isoformat()
                seating = serializer.update(seating, data)
                return Response(SeatingAssignmentSerializer(seating).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except SeatingAssignment.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        """Delete a seating assignment and all associated seat assignments"""
        try:
            seating = SeatingAssignment.objects.get(id=pk)
            # Delete only the seats that belong to this seating record
            SeatAssignment.objects(seating=seating).delete()
            seating.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except SeatingAssignment.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def available_classrooms(self, request):
        """Get available classrooms optionally filtered by seating department.

        If ``subject`` is provided as a query parameter, the "students_assigned"
        and "available_seats" values are calculated against the seating
        assignment for that subject in the room.  This prevents earlier
        seatings from affecting availability when the same classroom is being
        reused on a different date.
        """
        try:
            dept_id = request.query_params.get('department')
            subject_id = request.query_params.get('subject')
            print(f"[AVAILABLE_CLASSROOMS] dept_id: {dept_id}, subject_id: {subject_id}")
            
            classrooms = Classroom.objects()
            if dept_id:
                try:
                    dept = Department.objects.get(id=dept_id)
                    classrooms = Classroom.objects(department=dept)
                    print(f"[AVAILABLE_CLASSROOMS] Found {len(classrooms)} classrooms for department {dept.name}")
                except Department.DoesNotExist:
                    print(f"[AVAILABLE_CLASSROOMS] Department not found: {dept_id}")
                    return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)

            # if subject provided, resolve it once
            subject = None
            if subject_id:
                try:
                    subject = Subject.objects.get(id=subject_id)
                except Subject.DoesNotExist:
                    print(f"[AVAILABLE_CLASSROOMS] Subject not found: {subject_id}")
                    return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)

            classroom_data = []
            for classroom in classrooms:
                students_count = 0
                if subject:
                    seating = SeatingAssignment.objects(subject=subject, classroom=classroom).first()
                    students_count = len(seating.students) if seating else 0
                else:
                    existing = SeatingAssignment.objects(classroom=classroom).first()
                    students_count = len(existing.students) if existing else 0
                available_seats = classroom.capacity - students_count
                
                data = {
                    'id': str(classroom.id),
                    'room_number': classroom.room_number,
                    'department': str(classroom.department.id) if classroom.department else '',
                    'department_name': classroom.department.name if classroom.department else '',
                    'capacity': classroom.capacity,
                    'students_assigned': students_count,
                    'available_seats': available_seats
                }
                classroom_data.append(data)
            
            print(f"[AVAILABLE_CLASSROOMS] Returning {len(classroom_data)} classrooms")
            return Response(classroom_data)
        except Exception as e:
            import traceback
            print(f"[AVAILABLE_CLASSROOMS] ERROR: {str(e)}")
            traceback.print_exc()
            return Response(
                {'error': f'Error fetching classrooms: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def validate_assignment(self, request):
        """Validate if a student can be assigned to a classroom"""
        student_id = request.data.get('student_id')
        classroom_id = request.data.get('classroom_id')
        subject_id = request.data.get('subject_id')
        
        try:
            student = Student.objects.get(id=student_id)
            classroom = Classroom.objects.get(id=classroom_id)
            subject = Subject.objects.get(id=subject_id)
        except (Student.DoesNotExist, Classroom.DoesNotExist, Subject.DoesNotExist):
            return Response({'valid': False, 'error': 'Invalid IDs'}, status=status.HTTP_400_BAD_REQUEST)
        
        errors = []
        
        # Student department must be different from classroom department
        if student.department and classroom.department and student.department.id == classroom.department.id:
            errors.append('Student cannot be assigned to same department classroom')
        
        # Check if student already assigned to this subject
        existing_assignment = SeatingAssignment.objects(
            subject=subject,
            students=student
        ).first()
        if existing_assignment:
            errors.append(f'Student already assigned to {existing_assignment.classroom.room_number}')
        
        # Check classroom capacity
        seating = SeatingAssignment.objects(
            subject=subject,
            classroom=classroom
        ).first()
        
        if seating and len(seating.students) >= classroom.capacity:
            errors.append(f'Classroom {classroom.room_number} is full (capacity: {classroom.capacity})')
        
        return Response({
            'valid': len(errors) == 0,
            'errors': errors,
            'classroom_available_seats': classroom.capacity - (len(seating.students) if seating else 0)
        })

    @action(detail=False, methods=['post'])
    def assign_student(self, request):
        """Assign one or multiple students to a classroom sequentially with proper grid layout"""
        student_id = request.data.get('student_id')
        student_ids = request.data.get('student_ids', [])
        classroom_id = request.data.get('classroom_id')
        subject_id = request.data.get('subject_id')
        
        print(f"[ASSIGN_STUDENT] Request - student_id: {student_id}, student_ids: {student_ids}, classroom_id: {classroom_id}, subject_id: {subject_id}")
        
        try:
            classroom = Classroom.objects.get(id=classroom_id)
            subject = Subject.objects.get(id=subject_id)
            print(f"[ASSIGN_STUDENT] Found classroom: {classroom.room_number}, subject: {subject.name}")
        except (Classroom.DoesNotExist, Subject.DoesNotExist) as e:
            print(f"[ASSIGN_STUDENT] Error finding classroom or subject: {str(e)}")
            return Response({'error': 'Invalid IDs'}, status=status.HTTP_400_BAD_REQUEST)

        # Optional: validate seatingDept sent by frontend to avoid accidental cross-department assignment
        seating_dept = request.data.get('seating_dept') or request.data.get('seatingDept')
        if seating_dept:
            try:
                # classroom.department may be an object or id; compare robustly
                cls_dept = getattr(classroom, 'department', None)
                cls_dept_id = getattr(cls_dept, 'id', cls_dept) if cls_dept is not None else None
                print(f"[ASSIGN_STUDENT] Seating dept check - requested: {seating_dept}, classroom_dept: {cls_dept_id}")
                if cls_dept_id and str(cls_dept_id) != str(seating_dept):
                    return Response({'error': 'Classroom department does not match selected seating department'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                print(f"[ASSIGN_STUDENT] Dept validation error: {str(e)}")
                # fall through without blocking if validation can't be performed
        
        # continue normal flow

        # Get or create seating assignment
        seating = SeatingAssignment.objects(subject=subject, classroom=classroom).first()
        if not seating:
            seating = SeatingAssignment(
                subject=subject,
                classroom=classroom,
                status='draft',
                created_at=datetime.utcnow().isoformat(),
                updated_at=datetime.utcnow().isoformat()
            )
            print(f"[ASSIGN_STUDENT] Created new seating assignment")
        else:
            print(f"[ASSIGN_STUDENT] Found existing seating with {len(seating.students)} students")

        def assign_one(student):
            """Validate and add a single student to seating"""
            # Validations
            if student.department and classroom.department and student.department.id == classroom.department.id:
                return f"Student {student.name} cannot be assigned to same department classroom"
            if student in seating.students:
                return f"{student.name} already assigned"
            if len(seating.students) >= classroom.capacity:
                return f"Classroom is full (capacity: {classroom.capacity})"
            seating.students.append(student)
            return None

        # Process multiple students or single student
        errors = []
        students_to_add = []
        
        if student_ids:
            for sid in student_ids:
                try:
                    stu = Student.objects.get(id=sid)
                    students_to_add.append(stu)
                except Student.DoesNotExist:
                    errors.append(f"Student {sid} not found")
                    continue
        elif student_id:
            try:
                stu = Student.objects.get(id=student_id)
                students_to_add.append(stu)
            except Student.DoesNotExist:
                return Response({'error': 'Invalid student ID'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'No student specified'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate all students before adding
        for stu in students_to_add:
            err = assign_one(stu)
            if err:
                errors.append(err)
                break
        
        if errors:
            print(f"[ASSIGN_STUDENT] Validation errors: {errors}")
            return Response({'error': errors[0]}, status=status.HTTP_400_BAD_REQUEST)

        # After adding all students, recalculate grid positions
        # Standard grid: 4 columns per row
        grid_cols = 4
        total_students = len(seating.students)
        # Calculate rows needed (ceiling division)
        grid_rows = (total_students + grid_cols - 1) // grid_cols
        if grid_rows == 0:
            grid_rows = 1
        
        # Update seating with grid dimensions
        seating.grid_rows = grid_rows
        seating.grid_cols = grid_cols
        
        # Save seating first so that it exists in the database before we create
        # seat assignments that reference it
        seating.updated_at = datetime.utcnow().isoformat()
        seating.save()
        print(f"[ASSIGN_STUDENT] Saved seating before creating seat assignments")
        
        # Delete all existing seat assignments for *this seating* only
        # (earlier implementation removed every seat in the classroom which
        # clobbered other subjects sharing the room)
        SeatAssignment.objects(seating=seating).delete()
        
        # Create new seat assignments with proper row/column distribution
        # Distribution: fill rows left-to-right, then move to next row
        for index, student in enumerate(seating.students):
            row = index % grid_rows  # Rotate through rows
            column = index // grid_rows  # Move to next column after filling a row
            seat_number = index + 1  # Sequential numbering from 1 to total_students
            
            seat = SeatAssignment(
                seating=seating,
                classroom=classroom,
                student=student,
                row=row,
                column=column,
                seat_number=seat_number
            )
            seat.save()
            print(f"[ASSIGN_STUDENT] Saved seat: Student {student.name} -> Seat #{seat_number}, Row {row}, Col {column}")

        print(f"[ASSIGN_STUDENT] Completed seating with {len(seating.students)} students, grid: {grid_rows}x{grid_cols}")

        return Response(SeatingAssignmentSerializer(seating).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def assign_supervisors(self, request):
        """Assign 2 supervisors to a classroom for a subject"""
        classroom_id = request.data.get('classroom_id')
        subject_id = request.data.get('subject_id')
        supervisor_ids = request.data.get('supervisor_ids', [])
        
        if len(supervisor_ids) != 2:
            return Response({'error': 'Exactly 2 supervisors are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            classroom = Classroom.objects.get(id=classroom_id)
            subject = Subject.objects.get(id=subject_id)
            supervisors = [Teacher.objects.get(id=sid) for sid in supervisor_ids]
        except (Classroom.DoesNotExist, Subject.DoesNotExist, Teacher.DoesNotExist):
            return Response({'error': 'Invalid IDs'}, status=status.HTTP_400_BAD_REQUEST)
        
        # previously there were department-based restrictions here;
        # those have been removed so any two supervisors may be assigned.
        
        # Get or create seating assignment
        seating = SeatingAssignment.objects(
            subject=subject,
            classroom=classroom
        ).first()
        
        if not seating:
            seating = SeatingAssignment(
                subject=subject,
                classroom=classroom,
                status='draft',
                created_at=datetime.utcnow().isoformat(),
                updated_at=datetime.utcnow().isoformat()
            )
        
        seating.supervisors = supervisors
        seating.updated_at = datetime.utcnow().isoformat()
        seating.save()
        
        return Response(SeatingAssignmentSerializer(seating).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def remove_student(self, request):
        """Remove a student from seating assignment and recalculate grid"""
        seating_id = request.data.get('seating_id')
        student_id = request.data.get('student_id')
        
        try:
            seating = SeatingAssignment.objects.get(id=seating_id)
            student = Student.objects.get(id=student_id)
        except (SeatingAssignment.DoesNotExist, Student.DoesNotExist):
            return Response({'error': 'Invalid IDs'}, status=status.HTTP_400_BAD_REQUEST)
        
        if student in seating.students:
            seating.students.remove(student)
            
            # Remove seat assignment
            SeatAssignment.objects(seating=seating, student=student).delete()
            
            # Recalculate grid positions for remaining students
            grid_cols = 4
            total_students = len(seating.students)
            grid_rows = (total_students + grid_cols - 1) // grid_cols if total_students > 0 else 1
            
            # Update grid dimensions
            seating.grid_rows = grid_rows
            seating.grid_cols = grid_cols
            
            # Recalculate seats for this seating only
            SeatAssignment.objects(seating=seating).delete()
            for index, stud in enumerate(seating.students):
                row = index % grid_rows
                column = index // grid_rows
                seat_number = index + 1  # Sequential numbering from 1 to total_students
                seat = SeatAssignment(
                    seating=seating,
                    classroom=seating.classroom,
                    student=stud,
                    row=row,
                    column=column,
                    seat_number=seat_number
                )
                seat.save()
            
            seating.updated_at = datetime.utcnow().isoformat()
            seating.save()
        
        return Response(SeatingAssignmentSerializer(seating).data)

    @action(detail=False, methods=['post'])
    def finalize_assignment(self, request):
        """Finalize a seating assignment"""
        seating_id = request.data.get('seating_id')
        
        try:
            seating = SeatingAssignment.objects.get(id=seating_id)
        except SeatingAssignment.DoesNotExist:
            return Response({'error': 'Seating assignment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Validate before finalization
        if not seating.supervisors or len(seating.supervisors) != 2:
            return Response({'error': 'Exactly 2 supervisors must be assigned'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not seating.students or len(seating.students) == 0:
            return Response({'error': 'At least one student must be assigned'}, status=status.HTTP_400_BAD_REQUEST)
        
        seating.status = 'finalized'
        seating.updated_at = datetime.utcnow().isoformat()
        seating.save()
        
        return Response(SeatingAssignmentSerializer(seating).data)

    @action(detail=False, methods=['get'])
    def download_subject(self, request):
        """Generate a PDF containing seating for a given subject with student table."""
        try:
            subject_id = request.query_params.get('subject')
            
            if not subject_id:
                return Response({'error': 'Subject id required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                subject = Subject.objects.get(id=subject_id)
            except Subject.DoesNotExist:
                return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)

            # Get all assignments for this subject
            assignments = list(SeatingAssignment.objects(subject=subject))

            # Check if we have any assignments
            if not assignments:
                return Response({'error': 'No seating assignments found for this subject'}, status=status.HTTP_204_NO_CONTENT)

            # Generate PDF
            try:
                from io import BytesIO
                from reportlab.pdfgen import canvas
                from reportlab.lib import colors
                from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
                from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
                from reportlab.lib.units import inch
            except ImportError:
                return Response({'error': 'PDF library not installed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=(8.5*inch, 11*inch), topMargin=0.5*inch, bottomMargin=0.5*inch)
            elements = []
            styles = getSampleStyleSheet()
            
            # Title style
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=18,
                textColor=colors.black,
                spaceAfter=20,
                alignment=1  # center
            )
            
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=12,
                textColor=colors.black,
                spaceAfter=10,
                spaceBefore=10
            )
            
            subject_name = subject.name if hasattr(subject, 'name') else subject.subject_name
            elements.append(Paragraph(f"Seating Arrangement - {subject_name}", title_style))
            elements.append(Spacer(1, 0.2*inch))
            
            for seating in assignments:
                # Classroom header
                cr_num = seating.classroom.room_number if seating.classroom else 'N/A'
                cr_dept = seating.classroom.department.name if seating.classroom and seating.classroom.department else 'N/A'
                
                elements.append(Paragraph(f"Classroom: {cr_num} ({cr_dept})", heading_style))
                
                # Supervisors
                if seating.supervisors and len(seating.supervisors) > 0:
                    sup_str = ', '.join([s.name for s in seating.supervisors])
                    elements.append(Paragraph(f"<b>Supervisors:</b> {sup_str}", styles['Normal']))
                else:
                    elements.append(Paragraph(f"<b>Supervisors:</b> Not assigned", styles['Normal']))
                
                elements.append(Spacer(1, 0.1*inch))
                
                # Fetch seat assignments for this seating only
                seat_assignments = SeatAssignment.objects(seating=seating)
                
                if seat_assignments:
                    # Sort by seat number
                    sorted_seats = sorted(seat_assignments, key=lambda s: s.seat_number if hasattr(s, 'seat_number') and s.seat_number else 0)
                    
                    # Build table data with headers
                    table_data = [
                        ['Bench #', 'Student Name', 'Roll Number']
                    ]
                    
                    for seat in sorted_seats:
                        table_data.append([
                            str(seat.seat_number) if hasattr(seat, 'seat_number') and seat.seat_number else 'N/A',
                            seat.student.name if seat.student else 'N/A',
                            seat.student.roll_number if seat.student else 'N/A'
                        ])
                    
                    # Create table
                    table = Table(table_data, colWidths=[1.2*inch, 2.5*inch, 1.5*inch])
                    table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 11),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black),
                        ('FONTSIZE', (0, 1), (-1, -1), 9),
                        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
                    ]))
                    
                    elements.append(table)
                else:
                    elements.append(Paragraph("No students assigned to this classroom.", styles['Normal']))
                
                elements.append(Spacer(1, 0.3*inch))
                elements.append(PageBreak())
            
            # Build PDF
            doc.build(elements)
            buffer.seek(0)
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="seating_subject_{subject_id}.pdf"'
            return response
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Failed to generate PDF: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        return response

