import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { EventSource, TrackingEventType } from "@prisma/client";
import { IsDateString, IsEnum, IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export class AddEventDto {
  @ApiPropertyOptional({ description: "ISO 8601; por defecto ahora" })
  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @ApiProperty({ enum: TrackingEventType })
  @IsEnum(TrackingEventType)
  type!: TrackingEventType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  rawStatus?: string;

  @ApiPropertyOptional({ type: "object", additionalProperties: true })
  @IsOptional()
  @IsObject()
  location?: Record<string, unknown>;

  @ApiProperty({ enum: EventSource })
  @IsEnum(EventSource)
  source!: EventSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  correlationId?: string;

  @ApiPropertyOptional({ type: "object", additionalProperties: true })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
