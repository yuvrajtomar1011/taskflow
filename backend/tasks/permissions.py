from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwner(BasePermission):
    """
    Allows access only to owners of the object.
    """

    def has_object_permission(self, request, view, obj):
        # Read-only permissions are allowed
        if request.method in SAFE_METHODS:
            return True

        # Write permissions only for owner
        return obj.owner == request.user
