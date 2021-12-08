export class WebsocketNotice {
  client: any;

  constructor(client) {
    this.client = client;
  }

  send(data) {
    this.client.send(JSON.stringify(data));
  }

  logNotice(data) {
    this.send({ event: 'notice', data });
  }

  logInfo(data) {
    this.send({ event: 'info', data });
  }

  logSuccess(data) {
    this.send({ event: 'success', data });
  }

  logError(data) {
    this.send({ event: 'error', data });
  }

  close() {
    this.client.close();
  }
}
