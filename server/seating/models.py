from mongoengine import Document, ReferenceField, ListField, StringField, IntField

class SeatAssignment(Document):
    """Represents a student assignment to a specific seat (row, column) in a classroom.
    
    We now include a reference back to the parent ``SeatingAssignment`` so that
    multiple seatings in the same classroom (e.g. on different exam dates) can
    coexist without colliding.  The field is optional for existing records so
    upgrades won't break; new entries will always populate it.

    The grid is calculated as: 4 columns per row (configurable).
    For a classroom with capacity N and M students assigned:
    - grid_rows = ceil(M / 4)
    - grid_cols = 4
    - Each student gets: row = index % grid_rows, column = index // grid_rows
    - seat_number is a sequential identifier from 1 to number of students in the classroom
    """
    seating = ReferenceField('SeatingAssignment', required=False)
    classroom = ReferenceField('Classroom', required=True)
    student = ReferenceField('Student', required=True)
    row = IntField(required=True)  # Row position in grid (0-indexed)
    column = IntField(required=True)  # Column position in grid (0-indexed)
    seat_number = IntField()  # Sequential seat number (1 to total students in classroom)
    
    meta = {
        'collection': 'seat_assignments',
        # index on seating rather than (or in addition to) classroom ensures we
        # can look up seats belonging to a particular seating assignment.
        'indexes': [('seating', 'row', 'column'), ('classroom', 'row', 'column')]
    }

class SeatingAssignment(Document):
    """Represents complete seating arrangement for a subject in a classroom.
    
    Contains:
    - Reference to subject and classroom
    - List of assigned supervisors (exactly 2 required for finalization)
    - List of assigned students
    - Grid dimensions (calculated from student count)
    - Status: 'draft' or 'finalized'
    """
    subject = ReferenceField('Subject', required=True)
    classroom = ReferenceField('Classroom', required=True)
    supervisors = ListField(ReferenceField('Teacher'), max_length=2, blank=True)  # Exactly 2 supervisors for finalization
    students = ListField(ReferenceField('Student'), blank=True)  # All students assigned to this classroom
    status = StringField(default='draft', choices=['draft', 'finalized'])  # draft or finalized
    grid_rows = IntField(default=0)  # Number of rows in seating grid (calculated)
    grid_cols = IntField(default=0)  # Number of columns in seating grid (default 4)
    created_at = StringField()  # ISO format timestamp
    updated_at = StringField()  # ISO format timestamp

    def __str__(self):
        return f"{self.subject} in {self.classroom}"

    meta = {
        'collection': 'seating_assignments',
        'indexes': [('subject', 'classroom')]
    }