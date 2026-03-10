import { Injectable } from '@nestjs/common';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberHelperService } from './members.helper.service';
import { UserData } from 'src/common/interfaces/all.interfaces';
import { PaginateQuery } from 'nestjs-paginate';
import { plainToInstance } from 'class-transformer';
import { MemberResponseDto } from './dto/create-member.dto';

@Injectable()
export class MembersService {
   constructor(
      private memberHelperService: MemberHelperService
    ) { }

   async getMembers(query: PaginateQuery, userData: UserData): Promise<{ meta: any, data: MemberResponseDto[] }> {
    const members = await this.memberHelperService.getMembers(query, userData)
    return {
      ...members,
      data: plainToInstance(MemberResponseDto, members.data, { excludeExtraneousValues: true })
    }

  }

  async getMember(id: string, userData: UserData): Promise<MemberResponseDto> {
    const member = await this.memberHelperService.getMember(id, userData)
    return plainToInstance(MemberResponseDto, member, { excludeExtraneousValues: true })
  }

  async updateMemberRole(id: string, dto: UpdateMemberDto, userData: UserData): Promise<MemberResponseDto> {
    const member = await this.memberHelperService.updateMemberRole(id, dto, userData)
    return plainToInstance(MemberResponseDto, member, { excludeExtraneousValues: true })

  }

  async removeMember(id: string, userData: UserData): Promise<void> {
    await this.memberHelperService.removeMember(id, userData)
  }
}
