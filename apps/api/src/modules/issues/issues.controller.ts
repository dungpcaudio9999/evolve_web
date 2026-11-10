import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Issue } from '@evolve/shared';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateIssueDto, IssueFilterDto, UpdateIssueDto } from './dto/issue.dto';
import { IssuesService } from './issues.service';

@ApiTags('issues')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('issues')
export class IssuesController {
  constructor(private readonly issues: IssuesService) {}

  @Get()
  @ApiOperation({
    summary: 'Issue trong các project của mình, lọc theo project/status/priority/assignee/q',
  })
  list(@CurrentUser() user: AuthUser, @Query() filter: IssueFilterDto): Promise<Issue[]> {
    return this.issues.list(user.id, filter);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo issue: tự sinh identifier (KEY-số) và đặt cuối cột trạng thái' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateIssueDto): Promise<Issue> {
    return this.issues.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết issue (không phải chủ project → 404)' })
  get(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<Issue> {
    return this.issues.get(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Sửa issue; đổi status → cuối cột mới; labelIds thay toàn bộ nhãn' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateIssueDto,
  ): Promise<Issue> {
    return this.issues.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa issue' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> {
    return this.issues.remove(user.id, id);
  }
}
