import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CostCenterService } from './cost-center.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';
import { CostCenter } from './entities/cost-center.entity';
import { ResponseCostCenterDto } from './dto/response-cost-center-dto';

@Controller()
export class CostCenterController {
  constructor(private readonly costCenterService: CostCenterService) {}

  @MessagePattern('cost-center.create')
  async createCostCenter(
    @Payload() createCostCenterDto: CreateCostCenterDto,
  ): Promise<ResponseCostCenterDto> {
    return await this.costCenterService.create(createCostCenterDto);
  }

  @MessagePattern('cost-center.findAll')
  findAll(): Promise<CostCenter[]> {
    return this.costCenterService.findAll();
  }

  @MessagePattern('cost-center.findOne')
  findOne(@Payload() id: number): Promise<CostCenter> {
    return this.costCenterService.findOne(id);
  }

  @MessagePattern('cost-center.update')
  update(
    @Payload() data: { id: number; dto: UpdateCostCenterDto },
  ): Promise<CostCenter> {
    return this.costCenterService.update(data.id, data.dto);
  }

  @MessagePattern('cost-center.remove')
  async remove(
    @Payload() id: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.costCenterService.remove(id);
      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }
}
