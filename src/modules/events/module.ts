import { Module } from '@nestjs/common';
import { EventController } from './controller';
import { EventService } from './service';
import { EventsGateway } from './gateway';

@Module({
  providers: [EventsGateway, EventService],
  controllers: [EventController],
})
export class EventsModule {}
