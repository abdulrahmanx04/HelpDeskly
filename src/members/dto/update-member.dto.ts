import { TenantMemberRole } from 'src/common/enums/all.enums';
import { IsEnum } from 'class-validator';

export class UpdateMemberDto {
  @IsEnum(TenantMemberRole)
  role: TenantMemberRole;
}


