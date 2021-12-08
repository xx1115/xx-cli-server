import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ProjectModule } from './modules/project/module';
import { CommandModule } from './modules/command/module';
import { EventsModule } from './modules/events/module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL, {
      dbName: process.env.MONGO_DB_DBNAME,
      user: process.env.MONGO_DB_USER,
      pass: process.env.MONGO_DB_PASS,
    }),
    ProjectModule,
    CommandModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
