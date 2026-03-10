import { Expose, Type } from "class-transformer";
import { MemberStatus, TenantMemberRole } from "src/common/enums/all.enums";
import { UserDto } from "src/tenants/dto/create-tenant.dto";

export class MemberResponseDto {
  @Expose()
  id: string;

  @Expose()
  role: TenantMemberRole;

  @Expose()
  status: MemberStatus;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  invitedBy?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

