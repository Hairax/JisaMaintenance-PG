import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CostCenter } from './entities/cost-center.entity';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';
import { ResponseCostCenterDto } from './dto/response-cost-center-dto';

@Injectable()
export class CostCenterService {
  constructor(
    @Inject('COST_CENTER_REPOSITORY')
    private costCenterRepository: Repository<CostCenter>,
  ) {}

  async create(
    createCostCenterDto: CreateCostCenterDto,
  ): Promise<ResponseCostCenterDto> {
    const costCenter = this.costCenterRepository.create({
      ...createCostCenterDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const savedCostCenter = await this.costCenterRepository.save(costCenter);
    return {
      id: savedCostCenter.id,
      name: savedCostCenter.name,
      createdAt: savedCostCenter.createdAt,
      updatedAt: savedCostCenter.updatedAt,
    };
  }

  async findAll(): Promise<CostCenter[]> {
    return this.costCenterRepository.find();
  }

  async findOne(id: number): Promise<CostCenter> {
    const costCenter = await this.costCenterRepository.findOne({
      where: { id },
    });
    if (!costCenter) {
      throw new Error('Cost Center not found');
    }
    return costCenter;
  }

  async update(
    id: number,
    updateCostCenterDto: UpdateCostCenterDto,
  ): Promise<CostCenter> {
    const costCenter = await this.findOne(id);
    const updatedCostCenter = this.costCenterRepository.merge(costCenter, {
      ...updateCostCenterDto,
      updatedAt: new Date(),
    });
    return await this.costCenterRepository.save(updatedCostCenter);
  }

  async remove(id: number): Promise<void> {
    const costCenter = await this.findOne(id);
    await this.costCenterRepository.remove(costCenter);
  }
}
