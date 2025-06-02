import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { DevisService } from './devis.service';
import { CreateDevisDto } from './dto/create-devis.dto';
import { UpdateDevisDto } from './dto/update-devis.dto';

@Controller('devis')
export class DevisController {
  constructor(private readonly devisService: DevisService) {}

  @Post()
  create(@Body() createDevisDto: CreateDevisDto) {
    return this.devisService.create(createDevisDto);
  }
  @Get('user/:userId')
  async getDevisByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.devisService.findDevisByUser(userId);
  }
  @Get()
  findAll() {
    return this.devisService.findAll();
  }
@Get(':clientId/devis')
findDevisByClient(@Param('clientId', ParseIntPipe) clientId: number) {
  return this.devisService.findDevisByClient(clientId);
}
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.devisService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDevisDto: UpdateDevisDto,
  ) {
    return this.devisService.update(id, updateDevisDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.devisService.remove(id);
  }
}
