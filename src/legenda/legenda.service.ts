import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { LegendaDto, UpdateLegendaDto } from 'src/dto/legenda.dto';

@Injectable()
export class LegendaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: LegendaDto) {
    const legenda = await this.prisma.legenda.create({
      data: {
        profileId: data.profileId,
        legendaFoto: data.legendaFoto,
        nome: data.nome,
        titulo: data.titulo,
        subtitulo: data.subtitulo,
        descricao: data.descricao,
      },
    });

    return { message: 'Legenda criada com sucesso!' };
  }

  async updateLegenda(id: string, data: UpdateLegendaDto) {
    return this.prisma.legenda.update({
      where: { id },
      data: {
        legendaFoto: data.legendaFoto,
        nome: data.nome,
        titulo: data.titulo,
        subtitulo: data.subtitulo,
        descricao: data.descricao,
      },
    });
  }

  async getLegendaByProfileId(profileId: string) {
    return this.prisma.legenda.findFirst({
      where: { profileId },
    });
  }
}
