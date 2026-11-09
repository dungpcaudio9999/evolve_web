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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Project } from '@evolve/shared';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách project của người dùng hiện tại' })
  list(@CurrentUser() user: AuthUser): Promise<Project[]> {
    return this.projects.list(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo project (key trùng trong cùng chủ → 409)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto): Promise<Project> {
    return this.projects.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết project (không phải chủ → 404)' })
  get(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<Project> {
    return this.projects.get(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Sửa tên, icon, màu (không đổi được key)' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<Project> {
    return this.projects.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa project và toàn bộ issue của nó' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> {
    return this.projects.remove(user.id, id);
  }
}
