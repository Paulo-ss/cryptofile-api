import fs from "fs";
import { exec } from "child_process";

interface ClientIP {
  ip: string;
  accessessInLastFiveSeconds: number;
}

class WatchRequests {
  clientsAccessData: ClientIP[];

  constructor() {
    this.clientsAccessData = [];
  }

  banClientIP(ip: string) {
    exec(`sudo -H -u root bash -c "iptables -I INPUT -s ${ip} -j DROP"`);
  }

  resetClientsAccessess() {
    setInterval(() => {
      for (let i = 0; i < this.clientsAccessData.length; i++) {
        this.clientsAccessData[i].accessessInLastFiveSeconds = 0;
      }
    }, 10000);
  }

  incrementClientAccessessNumber(index: number) {
    this.clientsAccessData[index].accessessInLastFiveSeconds++;

    if (this.clientsAccessData[index].accessessInLastFiveSeconds >= 10) {
      this.banClientIP(this.clientsAccessData[index].ip);
    }
  }

  generateClientAccessObj(ip: string): ClientIP {
    return {
      ip,
      accessessInLastFiveSeconds: 1,
    };
  }

  getLatestClientIP(filename: string) {
    const file = fs.readFileSync(`../../../var/log/nginx/${filename}`, "utf-8");
    const clientsIPs = file.match(
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/gm
    );

    if (clientsIPs) {
      const latestClientIP = clientsIPs[clientsIPs.length - 1];

      const clientIndex = this.clientsAccessData.findIndex(
        (client) => client.ip === latestClientIP
      );

      if (clientIndex !== -1) {
        this.incrementClientAccessessNumber(clientIndex);
        return;
      }

      const newClientAccess = this.generateClientAccessObj(latestClientIP);
      this.clientsAccessData.push(newClientAccess);
    }
  }

  watchAccessLog() {
    fs.watch(
      "../../../var/log/nginx/access.log",
      "utf-8",
      (eventType, filename) => {
        if (eventType === "change") {
          this.getLatestClientIP(filename);
        }
      }
    );
  }

  init() {
    this.resetClientsAccessess();
    this.watchAccessLog();

    return this;
  }
}

export default WatchRequests;
