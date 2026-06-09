import { Controller, Post, Body } from '@nestjs/common';
import { EstimateService } from './estimate.service';

@Controller('estimate')
export class EstimateController {
  constructor(private readonly estimateService: EstimateService) {}

  @Post()
  submit(
    @Body()
    body: {
      firstName: string;
      lastName: string;
      address: string;
      postalCode: string;
      city: string;
      phone: string;
      email: string;
      propertyType: string;
      propertyAddress: string;
      rooms?: number;
      livingArea: number;
      landArea?: number;
      facades?: string;
      floor?: string;
      hasElevator?: boolean;
      hasPapers?: string;
      message?: string;
    },
  ) {
    return this.estimateService.submit(body);
  }
}
