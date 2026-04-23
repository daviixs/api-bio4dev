import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

const developerTemplateOptions = [
  'template_01',
  'template_02',
  'template_03',
] as const;

export class DeveloperOnboardingLegendaDto {
  @ApiPropertyOptional({ example: 'Ola, eu sou' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  greeting?: string;

  @ApiPropertyOptional({
    example: 'https://api.dicebear.com/9.x/initials/svg?seed=ana',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  legendaFoto?: string;

  @ApiProperty({ example: 'Ana Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @ApiProperty({ example: 'Developer Full Stack' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo: string;

  @ApiProperty({ example: 'React, Node e produtos digitais' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subtitulo: string;

  @ApiProperty({ example: 'Construo produtos e interfaces performaticas.' })
  @IsString()
  @IsNotEmpty()
  descricao: string;
}

export class DeveloperOnboardingSocialDto {
  @ApiProperty({ example: 'github' })
  @IsString()
  @IsNotEmpty()
  plataforma: string;

  @ApiProperty({ example: 'https://github.com/usuario' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  url: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  ordem?: number;
}

export class DeveloperOnboardingProjectDto {
  @ApiProperty({ example: 'Portfolio System' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'Sistema para criar portfolios.' })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiPropertyOptional({ example: 'https://portfolio.example.com' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  demoLink?: string;

  @ApiPropertyOptional({ example: 'https://github.com/org/repo' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  codeLink?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/project.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  gif?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  ordem?: number;

  @ApiPropertyOptional({ type: [String], example: ['React', 'TypeScript'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class DeveloperOnboardingTechnologyDto {
  @ApiProperty({ example: 'React' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'logos:react' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  icon: string;

  @ApiProperty({ example: 'text-cyan-500' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  color: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  ordem?: number;
}

export class DeveloperOnboardingTechStackDto {
  @ApiProperty({ example: 'Tech Stack' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'Tecnologias que uso no dia a dia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subtitle: string;

  @ApiPropertyOptional({ type: [DeveloperOnboardingTechnologyDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeveloperOnboardingTechnologyDto)
  technologies?: DeveloperOnboardingTechnologyDto[];
}

export class DeveloperOnboardingWorkTechnologyDto {
  @ApiProperty({ example: 'Node.js' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  technology: string;
}

export class DeveloperOnboardingWorkResponsibilityDto {
  @ApiProperty({ example: 'Arquitetura de APIs e automacao' })
  @IsString()
  @IsNotEmpty()
  responsibility: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  ordem?: number;
}

export class DeveloperOnboardingWorkExperienceDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  company: string;

  @ApiProperty({ example: '2023 - Atual' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  period: string;

  @ApiProperty({ example: 'Senior Frontend Engineer' })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiPropertyOptional({ example: 'Liderei migracao de arquitetura.' })
  @IsOptional()
  @IsString()
  impact?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  ordem?: number;

  @ApiPropertyOptional({ type: [DeveloperOnboardingWorkTechnologyDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeveloperOnboardingWorkTechnologyDto)
  technologies?: DeveloperOnboardingWorkTechnologyDto[];

  @ApiPropertyOptional({ type: [DeveloperOnboardingWorkResponsibilityDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeveloperOnboardingWorkResponsibilityDto)
  responsibilities?: DeveloperOnboardingWorkResponsibilityDto[];
}

export class DeveloperOnboardingFooterDto {
  @ApiProperty({ example: 'Contact' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'Aberto para novos projetos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subtitle: string;

  @ApiPropertyOptional({ example: 'contato@example.com' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ example: 'https://github.com/usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  github?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  linkedin?: string;

  @ApiPropertyOptional({ example: 'https://x.com/usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  twitter?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  instagram?: string;

  @ApiProperty({ example: 'Ana Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  copyrightName: string;

  @ApiPropertyOptional({ example: 'Made with Bio4Dev' })
  @IsOptional()
  @IsString()
  madeWith?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cv.pdf' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  resumeUrl?: string;
}

export class FinalizeDeveloperOnboardingDto {
  @ApiProperty({ example: 'draft-1234abcd' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  draftId: string;

  @ApiProperty({
    enum: developerTemplateOptions,
    example: 'template_01',
  })
  @IsString()
  @Matches(/^template_0[1-3]$/, {
    message: 'templateType deve ser template_01, template_02 ou template_03',
  })
  templateType: (typeof developerTemplateOptions)[number];

  @ApiProperty({ example: 'ana-silva-dev' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]{3,60}$/, {
    message:
      'slug deve ter 3-60 caracteres e conter apenas letras minúsculas, números e hífens',
  })
  slug: string;

  @ApiProperty({ example: 'Ana Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  displayName: string;

  @ApiPropertyOptional({
    example: 'https://api.dicebear.com/9.x/initials/svg?seed=ana-silva',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional({ type: DeveloperOnboardingLegendaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeveloperOnboardingLegendaDto)
  legenda?: DeveloperOnboardingLegendaDto;

  @ApiPropertyOptional({ type: [DeveloperOnboardingSocialDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => DeveloperOnboardingSocialDto)
  social?: DeveloperOnboardingSocialDto[];

  @ApiPropertyOptional({ type: [DeveloperOnboardingProjectDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(24)
  @ValidateNested({ each: true })
  @Type(() => DeveloperOnboardingProjectDto)
  projetos?: DeveloperOnboardingProjectDto[];

  @ApiPropertyOptional({ type: DeveloperOnboardingTechStackDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeveloperOnboardingTechStackDto)
  techStack?: DeveloperOnboardingTechStackDto;

  @ApiPropertyOptional({ type: [DeveloperOnboardingWorkExperienceDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(24)
  @ValidateNested({ each: true })
  @Type(() => DeveloperOnboardingWorkExperienceDto)
  workHistory?: DeveloperOnboardingWorkExperienceDto[];

  @ApiPropertyOptional({ type: DeveloperOnboardingFooterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeveloperOnboardingFooterDto)
  footer?: DeveloperOnboardingFooterDto;

  @ApiPropertyOptional({
    example: { source: 'frontend-draft' },
  })
  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}

export class FinalizeDeveloperOnboardingResponseDto {
  @ApiProperty({
    example: '2b6f7ad4-ef1b-4527-b8e1-5893d0ac8b3b',
  })
  profileId: string;

  @ApiProperty({
    enum: developerTemplateOptions,
    example: 'template_01',
  })
  templateType: string;

  @ApiProperty({
    example: '/dashboard',
  })
  redirectTo: string;
}
