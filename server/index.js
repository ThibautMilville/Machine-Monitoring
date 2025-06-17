import express from 'express';
import cors from 'cors';
import ping from 'ping';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 3001;
const DATA_FILE = './server/data/machines.json';
const ALERTS_FILE = './server/data/alerts.json';

app.use(cors());
app.use(express.json());

// Ensure data directory exists
try {
  await fs.mkdir('./server/data', { recursive: true });
} catch (error) {
  console.log('Data directory already exists');
}

// Load machines data
async function loadMachines() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No machines file found, starting with empty array');
    return [];
  }
}

// Save machines data
async function saveMachines(machines) {
  await fs.writeFile(DATA_FILE, JSON.stringify(machines, null, 2));
}

// Load alerts data
async function loadAlerts() {
  try {
    const data = await fs.readFile(ALERTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Save alerts data
async function saveAlerts(alerts) {
  await fs.writeFile(ALERTS_FILE, JSON.stringify(alerts, null, 2));
}

// Create alert
async function createAlert(machineId, machineName, type, message) {
  const alerts = await loadAlerts();
  const alert = {
    id: Date.now().toString(),
    machineId,
    machineName,
    type, // 'down', 'up', 'slow'
    message,
    timestamp: new Date().toISOString(),
    acknowledged: false
  };
  alerts.unshift(alert);
  // Keep only last 100 alerts
  if (alerts.length > 100) {
    alerts.splice(100);
  }
  await saveAlerts(alerts);
  return alert;
}

// Fast ping function for connectivity testing
async function fastPingMachine(host) {
  console.log(`Fast pinging ${host}...`);
  try {
    const isWindows = process.platform === 'win32';
    const pingConfig = {
      timeout: 1, // Timeout très rapide pour les tests
      extra: isWindows ? ['-n', '1'] : ['-c', '1']
    };
    
    const result = await ping.promise.probe(host, pingConfig);
    
    return {
      alive: result.alive,
      time: result.time === 'unknown' ? null : parseFloat(result.time),
      timestamp: new Date().toISOString(),
      host: result.host
    };
  } catch (error) {
    console.error(`Fast ping error for ${host}:`, error.message);
    return {
      alive: false,
      time: null,
      timestamp: new Date().toISOString(),
      error: error.message,
      host
    };
  }
}

// Improved ping function with better error handling and faster timeouts
async function pingMachine(host) {
  console.log(`Pinging ${host}...`);
  try {
    // Use different ping strategies based on OS with faster timeouts
    const isWindows = process.platform === 'win32';
    const pingConfig = {
      timeout: 2, // Réduit de 5 à 2 secondes
      extra: isWindows ? ['-n', '1'] : ['-c', '1']
    };
    
    const result = await ping.promise.probe(host, pingConfig);
    
    console.log(`Ping result for ${host}:`, {
      alive: result.alive,
      time: result.time,
      host: result.host
    });
    
    return {
      alive: result.alive,
      time: result.time === 'unknown' ? null : parseFloat(result.time),
      timestamp: new Date().toISOString(),
      host: result.host
    };
  } catch (error) {
    console.error(`Ping error for ${host}:`, error.message);
    return {
      alive: false,
      time: null,
      timestamp: new Date().toISOString(),
      error: error.message,
      host
    };
  }
}

// Calculate uptime percentage
function calculateUptime(history) {
  if (!history || history.length === 0) return 0;
  const onlineCount = history.filter(h => h.status === 'online').length;
  return Math.round((onlineCount / history.length) * 100);
}

// Get all machines
app.get('/api/machines', async (req, res) => {
  try {
    const machines = await loadMachines();
    // Add uptime percentage to each machine
    const machinesWithUptime = machines.map(machine => ({
      ...machine,
      uptimePercentage: calculateUptime(machine.history)
    }));
    res.json(machinesWithUptime);
  } catch (error) {
    console.error('Error loading machines:', error);
    res.status(500).json({ error: 'Failed to load machines' });
  }
});

// Add a new machine
app.post('/api/machines', async (req, res) => {
  try {
    const { name, host, description, category = 'Server' } = req.body;
    
    if (!name || !host) {
      return res.status(400).json({ error: 'Name and host are required' });
    }
    
    const machines = await loadMachines();
    
    // Check if host already exists
    const existingMachine = machines.find(m => m.host === host);
    if (existingMachine) {
      return res.status(409).json({ error: 'A machine with this host already exists' });
    }
    
    const newMachine = {
      id: Date.now().toString(),
      name,
      host,
      description: description || '',
      category,
      status: 'unknown',
      lastCheck: null,
      responseTime: null,
      uptime: 0,
      downtime: 0,
      history: [],
      uptimePercentage: 0,
      createdAt: new Date().toISOString()
    };
    
    machines.push(newMachine);
    await saveMachines(machines);
    
    console.log(`Added new machine: ${name} (${host})`);
    res.status(201).json(newMachine);
  } catch (error) {
    console.error('Error adding machine:', error);
    res.status(500).json({ error: 'Failed to add machine' });
  }
});

// Update a machine
app.put('/api/machines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const machines = await loadMachines();
    
    const machineIndex = machines.findIndex(m => m.id === id);
    if (machineIndex === -1) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    
    machines[machineIndex] = { ...machines[machineIndex], ...updates };
    await saveMachines(machines);
    res.json(machines[machineIndex]);
  } catch (error) {
    console.error('Error updating machine:', error);
    res.status(500).json({ error: 'Failed to update machine' });
  }
});

// Delete a machine
app.delete('/api/machines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const machines = await loadMachines();
    
    const machine = machines.find(m => m.id === id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    
    const filteredMachines = machines.filter(m => m.id !== id);
    await saveMachines(filteredMachines);
    
    console.log(`Deleted machine: ${machine.name}`);
    res.json({ message: 'Machine deleted successfully' });
  } catch (error) {
    console.error('Error deleting machine:', error);
    res.status(500).json({ error: 'Failed to delete machine' });
  }
});

// Ping a specific machine
app.post('/api/machines/:id/ping', async (req, res) => {
  try {
    const { id } = req.params;
    const machines = await loadMachines();
    
    const machine = machines.find(m => m.id === id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    
    const pingResult = await pingMachine(machine.host);
    const previousStatus = machine.status;
    
    // Update machine status
    machine.status = pingResult.alive ? 'online' : 'offline';
    machine.lastCheck = pingResult.timestamp;
    machine.responseTime = pingResult.time;
    
    // Create alerts for status changes
    if (previousStatus !== 'unknown' && previousStatus !== machine.status) {
      if (machine.status === 'offline') {
        await createAlert(machine.id, machine.name, 'down', `Machine ${machine.name} is now offline`);
      } else if (machine.status === 'online') {
        await createAlert(machine.id, machine.name, 'up', `Machine ${machine.name} is back online`);
      }
    }
    
    // Check for slow response
    if (machine.status === 'online' && pingResult.time && pingResult.time > 1000) {
      await createAlert(machine.id, machine.name, 'slow', `Machine ${machine.name} has slow response time: ${pingResult.time}ms`);
    }
    
    // Add to history (keep last 50 entries)
    machine.history = machine.history || [];
    machine.history.push({
      timestamp: pingResult.timestamp,
      status: machine.status,
      responseTime: pingResult.time
    });
    if (machine.history.length > 50) {
      machine.history = machine.history.slice(-50);
    }
    
    // Calculate uptime percentage
    machine.uptimePercentage = calculateUptime(machine.history);
    
    await saveMachines(machines);
    res.json({ machine, pingResult });
  } catch (error) {
    console.error('Error pinging machine:', error);
    res.status(500).json({ error: 'Failed to ping machine' });
  }
});

// Ping all machines (optimized with parallel execution)
app.post('/api/machines/ping-all', async (req, res) => {
  try {
    const machines = await loadMachines();
    
    console.log(`Pinging ${machines.length} machines in parallel...`);
    
    // Ping all machines in parallel pour plus de rapidité
    const pingPromises = machines.map(async (machine) => {
      const pingResult = await pingMachine(machine.host);
      const previousStatus = machine.status;
      
      machine.status = pingResult.alive ? 'online' : 'offline';
      machine.lastCheck = pingResult.timestamp;
      machine.responseTime = pingResult.time;
      
      // Create alerts for status changes
      if (previousStatus !== 'unknown' && previousStatus !== machine.status) {
        if (machine.status === 'offline') {
          await createAlert(machine.id, machine.name, 'down', `Machine ${machine.name} is now offline`);
        } else if (machine.status === 'online') {
          await createAlert(machine.id, machine.name, 'up', `Machine ${machine.name} is back online`);
        }
      }
      
      // Check for slow response
      if (machine.status === 'online' && pingResult.time && pingResult.time > 1000) {
        await createAlert(machine.id, machine.name, 'slow', `Machine ${machine.name} has slow response time: ${pingResult.time}ms`);
      }
      
      // Add to history
      machine.history = machine.history || [];
      machine.history.push({
        timestamp: pingResult.timestamp,
        status: machine.status,
        responseTime: pingResult.time
      });
      if (machine.history.length > 50) {
        machine.history = machine.history.slice(-50);
      }
      
      // Calculate uptime percentage
      machine.uptimePercentage = calculateUptime(machine.history);
      
      return { machine, pingResult };
    });
    
    const results = await Promise.all(pingPromises);
    
    await saveMachines(machines);
    console.log('Ping all completed in parallel');
    res.json(results);
  } catch (error) {
    console.error('Error pinging all machines:', error);
    res.status(500).json({ error: 'Failed to ping machines' });
  }
});

// Get alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await loadAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Error loading alerts:', error);
    res.status(500).json({ error: 'Failed to load alerts' });
  }
});

// Acknowledge alert
app.patch('/api/alerts/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    const alerts = await loadAlerts();
    
    const alert = alerts.find(a => a.id === id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    alert.acknowledged = true;
    alert.acknowledgedAt = new Date().toISOString();
    
    await saveAlerts(alerts);
    res.json(alert);
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// Get dashboard statistics
app.get('/api/stats', async (req, res) => {
  try {
    const machines = await loadMachines();
    const alerts = await loadAlerts();
    
    const stats = {
      totalMachines: machines.length,
      onlineMachines: machines.filter(m => m.status === 'online').length,
      offlineMachines: machines.filter(m => m.status === 'offline').length,
      unknownMachines: machines.filter(m => m.status === 'unknown').length,
      averageResponseTime: machines.filter(m => m.responseTime).reduce((acc, m) => acc + m.responseTime, 0) / machines.filter(m => m.responseTime).length || 0,
      totalAlerts: alerts.length,
      unacknowledgedAlerts: alerts.filter(a => !a.acknowledged).length,
      averageUptime: machines.reduce((acc, m) => acc + (m.uptimePercentage || 0), 0) / machines.length || 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Test connectivity to a host before adding (fast ping)
app.post('/api/test-connectivity', async (req, res) => {
  try {
    const { host } = req.body;
    
    if (!host) {
      return res.status(400).json({ error: 'Host is required' });
    }
    
    const pingResult = await fastPingMachine(host);
    res.json(pingResult);
  } catch (error) {
    console.error('Error testing connectivity:', error);
    res.status(500).json({ error: 'Failed to test connectivity' });
  }
});

// Terminal simulation endpoints

// Get system info for a machine
app.get('/api/machines/:id/system-info', async (req, res) => {
  try {
    const { id } = req.params;
    const machines = await loadMachines();
    
    const machine = machines.find(m => m.id === id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    // Simulate system information based on machine
    const systemInfo = {
      hostname: machine.name,
      platform: 'Linux Ubuntu 22.04.3 LTS',
      architecture: 'x86_64',
      uptime: `${Math.floor(Math.random() * 30)} days, ${Math.floor(Math.random() * 24)} hours, ${Math.floor(Math.random() * 60)} minutes`,
      kernel: '5.15.0-87-generic',
      memory: {
        total: `${8 + Math.floor(Math.random() * 24)} GB`,
        free: `${2 + Math.floor(Math.random() * 8)} GB`,
        used: `${4 + Math.floor(Math.random() * 16)} GB`,
        cached: `${1 + Math.floor(Math.random() * 4)} GB`
      },
      cpu: {
        model: 'Intel(R) Core(TM) i7-9700K CPU @ 3.60GHz',
        cores: 8,
        usage: Math.floor(Math.random() * 80) + 10,
        loadAverage: [
          (Math.random() * 2).toFixed(2),
          (Math.random() * 2).toFixed(2),
          (Math.random() * 2).toFixed(2)
        ]
      },
      network: {
        interfaces: [
          { 
            name: 'eth0', 
            ip: machine.host, 
            mac: '00:1B:44:11:3A:B7',
            rx_bytes: Math.floor(Math.random() * 1000000000),
            tx_bytes: Math.floor(Math.random() * 1000000000)
          },
          { 
            name: 'lo', 
            ip: '127.0.0.1', 
            mac: '00:00:00:00:00:00',
            rx_bytes: Math.floor(Math.random() * 100000),
            tx_bytes: Math.floor(Math.random() * 100000)
          }
        ]
      },
      disk: {
        filesystems: [
          {
            device: '/dev/sda1',
            mountpoint: '/',
            type: 'ext4',
            total: '500G',
            used: `${100 + Math.floor(Math.random() * 300)}G`,
            available: `${50 + Math.floor(Math.random() * 150)}G`,
            usePercent: Math.floor(Math.random() * 80) + 10
          },
          {
            device: '/dev/sda2',
            mountpoint: '/home',
            type: 'ext4',
            total: '1T',
            used: `${200 + Math.floor(Math.random() * 600)}G`,
            available: `${100 + Math.floor(Math.random() * 300)}G`,
            usePercent: Math.floor(Math.random() * 70) + 15
          }
        ]
      },
      processes: Math.floor(Math.random() * 200) + 100,
      users: Math.floor(Math.random() * 5) + 1,
      lastBoot: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    res.json(systemInfo);
  } catch (error) {
    console.error('Error getting system info:', error);
    res.status(500).json({ error: 'Failed to get system info' });
  }
});

// Execute a command on a machine (simulation)
app.post('/api/machines/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { command } = req.body;
    
    const machines = await loadMachines();
    const machine = machines.find(m => m.id === id);
    
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    // Simulate command execution delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 2000));

    let output = '';
    let exitCode = 0;
    const cmd = command.toLowerCase().trim();

    // Simulate different commands
    switch (cmd) {
      case 'pwd':
        output = '/home/ubuntu';
        break;
      case 'whoami':
        output = 'ubuntu';
        break;
      case 'date':
        output = new Date().toString();
        break;
      case 'uptime':
        output = `${new Date().toTimeString().split(' ')[0]} up ${Math.floor(Math.random() * 30)} days, ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}, ${Math.floor(Math.random() * 5) + 1} users, load average: ${(Math.random() * 2).toFixed(2)}, ${(Math.random() * 2).toFixed(2)}, ${(Math.random() * 2).toFixed(2)}`;
        break;
      case 'ls':
      case 'ls -l':
      case 'ls -la':
        output = `total 32
drwxr-xr-x 4 ubuntu ubuntu 4096 ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} .
drwxr-xr-x 3 root   root   4096 ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} ..
-rw-r--r-- 1 ubuntu ubuntu  220 ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} .bash_logout
-rw-r--r-- 1 ubuntu ubuntu 3771 ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} .bashrc
drwx------ 2 ubuntu ubuntu 4096 ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} .cache
-rw-r--r-- 1 ubuntu ubuntu  807 ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} .profile
drwxrwxr-x 3 ubuntu ubuntu 4096 ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} projects`;
        break;
      case 'ps aux':
        output = `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  19564  2012 ?        Ss   ${new Date().getMonth() + 1}${new Date().getDate()}   0:01 /sbin/init
root         2  0.0  0.0      0     0 ?        S    ${new Date().getMonth() + 1}${new Date().getDate()}   0:00 [kthreadd]
root      ${Math.floor(Math.random() * 9000) + 1000}  ${(Math.random() * 5).toFixed(1)}  ${(Math.random() * 10).toFixed(1)} ${Math.floor(Math.random() * 500000) + 100000} ${Math.floor(Math.random() * 100000) + 10000} ?        R    ${new Date().getHours()}:${new Date().getMinutes()}   ${Math.floor(Math.random() * 60)}:${Math.floor(Math.random() * 60)} node server.js
www-data  ${Math.floor(Math.random() * 9000) + 1000}  ${(Math.random() * 3).toFixed(1)}  ${(Math.random() * 8).toFixed(1)} ${Math.floor(Math.random() * 300000) + 80000} ${Math.floor(Math.random() * 80000) + 5000} ?        S    ${new Date().getHours() - 1}:${new Date().getMinutes()}   ${Math.floor(Math.random() * 30)}:${Math.floor(Math.random() * 60)} nginx: worker
ubuntu   ${Math.floor(Math.random() * 9000) + 1000}  ${(Math.random() * 1).toFixed(1)}  ${(Math.random() * 2).toFixed(1)} ${Math.floor(Math.random() * 50000) + 10000} ${Math.floor(Math.random() * 10000) + 2000} pts/0    S    ${new Date().getHours()}:${new Date().getMinutes()}   0:00 bash`;
        break;
      case 'df -h':
        output = `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       ${Math.floor(Math.random() * 900) + 100}G  ${Math.floor(Math.random() * 500) + 100}G  ${Math.floor(Math.random() * 300) + 50}G  ${Math.floor(Math.random() * 70) + 20}% /
tmpfs           ${Math.floor(Math.random() * 16) + 4}G     0  ${Math.floor(Math.random() * 16) + 4}G   0% /dev/shm
/dev/sda2       ${Math.floor(Math.random() * 500) + 100}G  ${Math.floor(Math.random() * 200) + 50}G  ${Math.floor(Math.random() * 200) + 30}G  ${Math.floor(Math.random() * 60) + 20}% /home`;
        break;
      case 'free -h':
        const totalMem = Math.floor(Math.random() * 24) + 8;
        const usedMem = Math.floor(Math.random() * (totalMem - 2)) + 1;
        const freeMem = totalMem - usedMem;
        output = `              total        used        free      shared  buff/cache   available
Mem:            ${totalMem}Gi       ${usedMem}Gi       ${freeMem}Gi       ${Math.floor(Math.random() * 2)}Gi       ${Math.floor(Math.random() * 4) + 1}Gi       ${freeMem + Math.floor(Math.random() * 2)}Gi
Swap:          2.0Gi       ${Math.floor(Math.random() * 500)}Mi       ${2.0 - (Math.floor(Math.random() * 500) / 1024).toFixed(1)}Gi`;
        break;
      case 'ip addr show':
      case 'ifconfig':
        output = `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether ${['00', '1b', '44', '11', '3a', 'b7'].map(x => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':')} brd ff:ff:ff:ff:ff:ff
    inet ${machine.host}/24 brd 192.168.1.255 scope global dynamic eth0`;
        break;
      case 'netstat -tuln':
        output = `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN
tcp6       0      0 :::22                   :::*                    LISTEN
tcp6       0      0 :::80                   :::*                    LISTEN
udp        0      0 0.0.0.0:68              0.0.0.0:*
udp        0      0 127.0.0.1:53            0.0.0.0:*`;
        break;
      default:
        if (cmd.startsWith('ping ')) {
          const target = cmd.split(' ')[1] || 'localhost';
          output = `PING ${target} (${target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=${(Math.random() * 50 + 1).toFixed(1)} ms
64 bytes from ${target}: icmp_seq=2 ttl=64 time=${(Math.random() * 50 + 1).toFixed(1)} ms
64 bytes from ${target}: icmp_seq=3 ttl=64 time=${(Math.random() * 50 + 1).toFixed(1)} ms
64 bytes from ${target}: icmp_seq=4 ttl=64 time=${(Math.random() * 50 + 1).toFixed(1)} ms

--- ${target} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss
rtt min/avg/max/mdev = ${(Math.random() * 50 + 1).toFixed(1)}/${(Math.random() * 50 + 10).toFixed(1)}/${(Math.random() * 50 + 20).toFixed(1)}/${(Math.random() * 5).toFixed(1)} ms`;
        } else if (cmd.startsWith('systemctl status ')) {
          const service = cmd.split(' ')[2] || 'unknown';
          const isActive = Math.random() > 0.3;
          output = `● ${service}.service - ${service.charAt(0).toUpperCase() + service.slice(1)} Service
   Loaded: loaded (/lib/systemd/system/${service}.service; ${isActive ? 'enabled' : 'disabled'}; vendor preset: enabled)
   Active: ${isActive ? 'active (running)' : 'inactive (dead)'} since ${new Date().toDateString()} ${new Date().toTimeString().split(' ')[0]}
     Docs: man:${service}(8)
${isActive ? `Main PID: ${Math.floor(Math.random() * 30000) + 1000} (${service})
    Tasks: ${Math.floor(Math.random() * 10) + 1} (limit: 4915)
   Memory: ${(Math.random() * 100).toFixed(1)}M` : ''}`;
        } else if (cmd.startsWith('tail ') || cmd.startsWith('cat ')) {
          const file = cmd.split(' ')[1] || '/var/log/syslog';
          output = `==> ${file} <==
${new Date().toISOString()} ${machine.name} systemd[1]: Started Session ${Math.floor(Math.random() * 1000)} of user ubuntu.
${new Date().toISOString()} ${machine.name} kernel: [${Math.floor(Math.random() * 100000)}.${Math.floor(Math.random() * 1000)}] TCP: request_sock_TCP: Possible SYN flooding
${new Date().toISOString()} ${machine.name} sshd[${Math.floor(Math.random() * 10000) + 1000}]: Accepted publickey for ubuntu from 192.168.1.${Math.floor(Math.random() * 254) + 1}
${new Date().toISOString()} ${machine.name} systemd[1]: Started User Manager for UID 1000.
${new Date().toISOString()} ${machine.name} NetworkManager[${Math.floor(Math.random() * 5000) + 1000}]: <info>  device (eth0): state change`;
        } else {
          output = `bash: ${command}: command not found`;
          exitCode = 127;
        }
    }

    res.json({
      output,
      exitCode,
      timestamp: new Date().toISOString(),
      command,
      machine: machine.name
    });

  } catch (error) {
    console.error('Error executing command:', error);
    res.status(500).json({ error: 'Failed to execute command' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    platform: process.platform
  });
});

app.listen(PORT, () => {
  console.log(`🚀 BankAlpha Network Monitor Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:5173`);
  console.log(`🔗 API: http://localhost:${PORT}`);
  console.log(`💻 Platform: ${process.platform}`);
});