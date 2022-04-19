import fs from "fs";

interface ClientIPs {
  ip: string;
  accessessInLastFiveSeconds: number;
  firstAccessTimeInFiveSeconds: number;
}

class WatchRequests {
  clientsIPs: ClientIPs[];

  constructor() {
    this.clientsIPs = [];
  }

  getClientIP(filename: string) {
    const file = fs.readFileSync(`./src/${filename}`, "utf-8");
    const accessessArray = file.split(/\n/);

    if (accessessArray[0] !== "") {
      accessessArray.map((access, index) => {
        const ip = access.match(
          /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g
        );

        const clientIP = this.clientsIPs.find((clientip) => clientip.ip === ip);

        if (clientIP) {
          this.clientsIPs[index].accessessInLastFiveSeconds++;
          return;
        }

        this.clientsIPs.push({
          ip: ip[0],
          accessessInLastFiveSeconds: 1,
          firstAccessTimeInFiveSeconds: Date.now(),
        });
      });
    }

    console.log(this.clientsIPs);
  }

  watchAccessLog() {
    fs.watch("./src/access.log", "utf-8", (eventType, filename) => {
      if (eventType === "change") {
        this.getClientIP(filename);
      }
    });
  }
}

export default new WatchRequests();
