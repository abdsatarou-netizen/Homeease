import { Module } from '@nestjs/common';
import { ViewingRequestsService } from './viewing-requests.service';
import { ViewingRequestsController } from './viewing-requests.controller';

@Module({
  providers: [ViewingRequestsService],
  controllers: [ViewingRequestsController],
})
export class ViewingRequestsModule {}
