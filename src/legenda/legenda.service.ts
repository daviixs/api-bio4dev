import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { LegendaDto, UpdateLegendaDto } from 'src/dto/legenda.dto';

@Injectable()
export class LegendaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: LegendaDto) {
    // Verifica se já existe legenda para este profile
    const existingLegenda = await this.prisma.legenda.findFirst({
      where: { profileId: data.profileId },
    });

    // Se já existe, atualiza ao invés de criar duplicata
    if (existingLegenda) {
      const updatedLegenda = await this.prisma.legenda.update({
        where: { id: existingLegenda.id },
        data: {
          legendaFoto: data.legendaFoto || existingLegenda.legendaFoto,
          greeting: data.greeting,
          nome: data.nome,
          titulo: data.titulo,
          subtitulo: data.subtitulo,
          descricao: data.descricao,
        },
      });
      return {
        message: 'Legenda atualizada com sucesso!',
        legenda: updatedLegenda,
      };
    }

    const legenda = await this.prisma.legenda.create({
      data: {
        profileId: data.profileId,
        legendaFoto:
          data.legendaFoto || 'https://api.dicebear.com/7.x/avataaars/svg',
        greeting: data.greeting,
        nome: data.nome,
        titulo: data.titulo,
        subtitulo: data.subtitulo,
        descricao: data.descricao,
      },
    });

    return { message: 'Legenda criada com sucesso!', legenda };
  }

  async updateLegenda(id: string, data: UpdateLegendaDto) {
    return this.prisma.legenda.update({
      where: { id },
      data: {
        legendaFoto: data.legendaFoto,
        greeting: data.greeting,
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
