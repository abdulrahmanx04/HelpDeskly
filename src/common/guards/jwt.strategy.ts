import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.getOrThrow('JWT'),
            ignoreExpiration: false
        })
    }
    async validate(payload: any) {
        return {
            id: payload.sub,
            email: payload.email,
            tenantRole: payload.tenantRole,
            tenantId: payload.tenantId
        }
    }
}