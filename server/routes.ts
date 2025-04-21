import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMedicationSchema, 
  insertMedicationLogSchema,
  type Medication,
  type MedicationLog
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to handle Zod validation errors
  const validateRequest = (schema: any, handler: (req: Request, res: Response) => Promise<void>) => {
    return async (req: Request, res: Response) => {
      try {
        req.body = schema.parse(req.body);
        await handler(req, res);
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          res.status(400).json({ error: validationError.message });
        } else {
          res.status(500).json({ error: "Internal server error" });
        }
      }
    };
  };

  // API Routes
  // Medications
  app.get('/api/medications', async (req: Request, res: Response) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medications" });
    }
  });

  app.get('/api/medications/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid medication ID" });
      }

      const medication = await storage.getMedicationById(id);
      if (!medication) {
        return res.status(404).json({ error: "Medication not found" });
      }

      res.json(medication);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medication" });
    }
  });

  app.post('/api/medications', validateRequest(insertMedicationSchema, async (req: Request, res: Response) => {
    try {
      const medication = await storage.createMedication(req.body);
      
      // Get medication details
      const { frequency, reminderTime, daysOfWeek } = req.body;
      
      // Get today's details
      const today = new Date();
      const todayStr = format(today, 'EEEE').toLowerCase().substring(0, 2);
      const todayKey = todayStr === 'su' ? 'Su' : todayStr === 'mo' ? 'M' : todayStr === 'tu' ? 'T' : 
                      todayStr === 'we' ? 'W' : todayStr === 'th' ? 'Th' : todayStr === 'fr' ? 'F' : 'Sa';
      
      // Create medication logs for today and future days
      // Create logs for the next 30 days
      for (let i = 0; i < 30; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i);
        
        const futureDayStr = format(futureDate, 'EEEE').toLowerCase().substring(0, 2);
        const futureDayKey = futureDayStr === 'su' ? 'Su' : futureDayStr === 'mo' ? 'M' : futureDayStr === 'tu' ? 'T' : 
                      futureDayStr === 'we' ? 'W' : futureDayStr === 'th' ? 'Th' : futureDayStr === 'fr' ? 'F' : 'Sa';
        
        // Check if this day is selected in the daysOfWeek
        if (daysOfWeek && daysOfWeek[futureDayKey]) {
          const [hours, minutes] = reminderTime.split(':').map(Number);
          const scheduledTime = new Date(futureDate);
          scheduledTime.setHours(hours, minutes, 0, 0);
          
          // Determine status
          let status = 'upcoming';
          if (i === 0) { // Today
            status = scheduledTime < today ? 'missed' : 'upcoming';
          }
          
          // Create medication log
          await storage.createMedicationLog({
            medicationId: medication.id,
            scheduledTime,
            status,
            userId: medication.userId || null,
          });
        }
      }
      
      res.status(201).json(medication);
    } catch (error) {
      console.error("Error creating medication:", error);
      res.status(500).json({ error: "Failed to create medication" });
    }
  }));

  app.put('/api/medications/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid medication ID" });
      }

      const updateData = req.body;
      const updatedMedication = await storage.updateMedication(id, updateData);
      
      if (!updatedMedication) {
        return res.status(404).json({ error: "Medication not found" });
      }

      res.json(updatedMedication);
    } catch (error) {
      res.status(500).json({ error: "Failed to update medication" });
    }
  });

  app.delete('/api/medications/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid medication ID" });
      }

      const success = await storage.deleteMedication(id);
      if (!success) {
        return res.status(404).json({ error: "Medication not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete medication" });
    }
  });

  // Medication Logs
  app.get('/api/medication-logs', async (req: Request, res: Response) => {
    try {
      let logs: MedicationLog[] = [];
      
      // If date parameter is provided, filter by date
      if (req.query.date) {
        const date = new Date(req.query.date as string);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ error: "Invalid date format" });
        }
        logs = await storage.getMedicationLogsByDate(date);
      } 
      // If week parameter is provided, get logs for the week
      else if (req.query.week) {
        const date = new Date(req.query.week as string);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ error: "Invalid date format" });
        }
        
        // Check if we need to get monthly data instead (for calendar view)
        if (req.query.view === 'month') {
          const start = startOfMonth(date);
          const end = endOfMonth(date);
          logs = await storage.getMedicationLogsByWeek(start, end);
        } else {
          const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
          const end = endOfWeek(date, { weekStartsOn: 1 });
          logs = await storage.getMedicationLogsByWeek(start, end);
        }
      } 
      // Otherwise, get all logs
      else {
        logs = await storage.getMedicationLogs();
      }

      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medication logs" });
    }
  });

  app.post('/api/medication-logs', validateRequest(insertMedicationLogSchema, async (req: Request, res: Response) => {
    try {
      const log = await storage.createMedicationLog(req.body);
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to create medication log" });
    }
  }));

  app.put('/api/medication-logs/:id/mark-as-taken', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid log ID" });
      }

      const takenTime = req.body.takenTime ? new Date(req.body.takenTime) : new Date();
      const updatedLog = await storage.updateMedicationLogStatus(id, 'taken', takenTime);
      
      if (!updatedLog) {
        return res.status(404).json({ error: "Medication log not found" });
      }

      res.json(updatedLog);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark medication as taken" });
    }
  });

  app.put('/api/medication-logs/:id/mark-as-missed', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid log ID" });
      }

      const updatedLog = await storage.updateMedicationLogStatus(id, 'missed');
      
      if (!updatedLog) {
        return res.status(404).json({ error: "Medication log not found" });
      }

      res.json(updatedLog);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark medication as missed" });
    }
  });

  // Route to get today's medications with their status
  app.get('/api/today-medications', async (req: Request, res: Response) => {
    try {
      const today = new Date();
      const logs = await storage.getMedicationLogsByDate(today);
      
      // Get all medications
      const medications = await storage.getMedications();
      
      // Map logs to medications with status
      const todayMedications = logs.map(log => {
        const medication = medications.find(med => med.id === log.medicationId);
        if (!medication) return null;
        
        return {
          ...medication,
          status: log.status,
          scheduledTime: log.scheduledTime,
          takenTime: log.takenTime,
          logId: log.id
        };
      }).filter(Boolean);
      
      res.json(todayMedications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's medications" });
    }
  });

  // Route to get adherence data for the past week
  app.get('/api/adherence', async (req: Request, res: Response) => {
    try {
      const today = new Date();
      const startOfLastWeek = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
      const logs = await storage.getMedicationLogsByWeek(startOfLastWeek, today);
      
      // Group logs by day
      const adherenceByDay = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfLastWeek);
        date.setDate(date.getDate() + i);
        const dayStr = format(date, 'EEE'); // 'Mon', 'Tue', etc.
        
        const dayLogs = logs.filter(log => {
          const logDate = new Date(log.scheduledTime);
          return logDate.getDate() === date.getDate() && 
                 logDate.getMonth() === date.getMonth() && 
                 logDate.getFullYear() === date.getFullYear();
        });
        
        const taken = dayLogs.filter(log => log.status === 'taken').length;
        const missed = dayLogs.filter(log => log.status === 'missed').length;
        const upcoming = dayLogs.filter(log => log.status === 'upcoming').length;
        const total = dayLogs.length;
        
        return {
          day: dayStr,
          taken,
          missed,
          upcoming,
          total,
          adherenceRate: total > 0 ? taken / total : 0
        };
      });
      
      // Calculate overall adherence
      const allLogs = logs.filter(log => log.status !== 'upcoming');
      const takenLogs = allLogs.filter(log => log.status === 'taken');
      const overallAdherence = allLogs.length > 0 ? takenLogs.length / allLogs.length : 0;
      
      res.json({
        adherenceByDay,
        overallAdherence: Math.round(overallAdherence * 100)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch adherence data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
