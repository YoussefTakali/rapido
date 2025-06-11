import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MailService } from './mail.service';
import { SendDevisDto } from './dto/create-mail.dto';



@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

@Post('send-devis')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'pdf1', maxCount: 1 },
  { name: 'pdf2', maxCount: 1 },
  { name: 'pdf3', maxCount: 1 },
]))
async sendDevisMail(
  @UploadedFiles()
  files: {
    pdf1?: Express.Multer.File[],
    pdf2?: Express.Multer.File[],
    pdf3?: Express.Multer.File[],
  },
  @Body() body: any,
) {
  const pdf1 = files.pdf1?.[0];
  const pdf2 = files.pdf2?.[0];
  const pdf3 = files.pdf3?.[0];

  if (!pdf1 || !pdf2) {
    throw new BadRequestException('Required PDF files not found');
  }
  console.log(body)
  const mailData: SendDevisDto = {
    client_name: body.clientName,
    client_email: body.clientEmail,
    devis_number: body.devisNumber,
    dem_date: body.demDate,
    company_name: body.companyName,
    company_email: body.companyEmail,
    total_ttc: body.totalTtc ? parseFloat(body.totalTtc.toString()) : undefined,
    total_M: body.totalM ? parseFloat(body.totalM.toString()) : 0,    pdf1Content: pdf1.buffer,
    pdf2Content: pdf2.buffer,
    pdf3Content: pdf3?.buffer,
  };
  await this.mailService.sendDevisMail(mailData);

  return {
    success: true,
    message: 'Email sent successfully!',
  };
}

}