from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Allow access only to Admin users."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'

class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow write access only to Admin users; anyone authenticated can read."""
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            if request.method in permissions.SAFE_METHODS:
                return True
            return request.user.role == 'ADMIN'
        return False

class IsOfficeInChargeOrAdmin(permissions.BasePermission):
    """Allow access to Admin and Office Incharge users (read-only for Office Incharge)."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if request.user.role == 'ADMIN':
            return True
        
        if request.user.role == 'OFFICE_INCHARGE':
            # Office Incharge can only read
            return request.method in permissions.SAFE_METHODS
        
        return False
