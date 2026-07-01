import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from './casl-ability.factory';
import { PERMISSIONS_KEY, PermissionRule } from './permissions.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<PermissionRule[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true; // No specific permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié.');
    }

    const ability = await this.caslAbilityFactory.createForUser(user);

    const hasPermission = requiredPermissions.every((rule) =>
      ability.can(rule.action, rule.subject),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Vous ne disposez pas des permissions requises pour cette action.',
      );
    }

    return true;
  }
}
