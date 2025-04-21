import {
  medications,
  type Medication,
  type InsertMedication,
  medicationLogs,
  type MedicationLog,
  type InsertMedicationLog,
  users,
  type User,
  type InsertUser
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Medication methods
  getMedications(): Promise<Medication[]>;
  getMedicationById(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<boolean>;

  // Medication logs methods
  getMedicationLogs(): Promise<MedicationLog[]>;
  getMedicationLogsByDate(date: Date): Promise<MedicationLog[]>;
  getMedicationLogsByWeek(startDate: Date, endDate: Date): Promise<MedicationLog[]>;
  createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog>;
  updateMedicationLogStatus(id: number, status: string, takenTime?: Date): Promise<MedicationLog | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private medications: Map<number, Medication>;
  private medicationLogs: Map<number, MedicationLog>;
  private userId: number;
  private medicationId: number;
  private logId: number;

  constructor() {
    this.users = new Map();
    this.medications = new Map();
    this.medicationLogs = new Map();
    this.userId = 1;
    this.medicationId = 1;
    this.logId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Medication methods
  async getMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values());
  }

  async getMedicationById(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = this.medicationId++;
    const medication: Medication = { ...insertMedication, id };
    this.medications.set(id, medication);
    return medication;
  }

  async updateMedication(id: number, updateData: Partial<InsertMedication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;

    const updatedMedication = { ...medication, ...updateData };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }

  async deleteMedication(id: number): Promise<boolean> {
    return this.medications.delete(id);
  }

  // Medication logs methods
  async getMedicationLogs(): Promise<MedicationLog[]> {
    return Array.from(this.medicationLogs.values());
  }

  async getMedicationLogsByDate(date: Date): Promise<MedicationLog[]> {
    // Format date to YYYY-MM-DD for comparison
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return Array.from(this.medicationLogs.values()).filter(log => {
      const logDate = new Date(log.scheduledTime);
      return logDate >= targetDate && logDate < nextDay;
    });
  }

  async getMedicationLogsByWeek(startDate: Date, endDate: Date): Promise<MedicationLog[]> {
    return Array.from(this.medicationLogs.values()).filter(log => {
      const logDate = new Date(log.scheduledTime);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  async createMedicationLog(insertLog: InsertMedicationLog): Promise<MedicationLog> {
    const id = this.logId++;
    const log: MedicationLog = { ...insertLog, id };
    this.medicationLogs.set(id, log);
    return log;
  }

  async updateMedicationLogStatus(id: number, status: string, takenTime?: Date): Promise<MedicationLog | undefined> {
    const log = this.medicationLogs.get(id);
    if (!log) return undefined;

    const updatedLog = { 
      ...log, 
      status, 
      ...(takenTime ? { takenTime } : {}) 
    };
    
    this.medicationLogs.set(id, updatedLog);
    return updatedLog;
  }
}

export const storage = new MemStorage();
