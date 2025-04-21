import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProcessService } from './process.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { Process } from './entities/process.entity';
import { ResponseProcessDto } from './dto/response-process.dto';

@Controller()
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @MessagePattern('process.create')
  async createProcess(
    @Payload() createProcessDto: CreateProcessDto,
  ): Promise<ResponseProcessDto> {
    return await this.processService.create(createProcessDto);
  }
  @MessagePattern('process.findAll')
  findAll(): Promise<ResponseProcessDto[]> {
    return this.processService.findAll();
  }
  @MessagePattern('process.findOne')
  findOne(@Payload() id: number): Promise<ResponseProcessDto> {
    return this.processService.findOne(id);
  }
  @MessagePattern('process.update')
  update(
    @Payload() data: { id: number; dto: UpdateProcessDto },
  ): Promise<Process> {
    return this.processService.update(data.id, data.dto);
  }
  @MessagePattern('process.remove')
  async remove(
    @Payload() id: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.processService.remove(id);
      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }
}
