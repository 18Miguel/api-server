import { SetMetadata } from '@nestjs/common';
import UserRoles from '../Enums/UserRoles';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<UserRoles>) => SetMetadata(ROLES_KEY, roles);
