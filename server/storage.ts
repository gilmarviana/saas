import { 
  users, clients, projects, services, subscriptions, meetings,
  type User, type InsertUser, type Client, type InsertClient,
  type Project, type InsertProject, type Service, type InsertService,
  type Subscription, type InsertSubscription, type Meeting, type InsertMeeting
} from "@shared/schema";
import { db } from "./db";
import { eq, count } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserStripeInfo(id: number, customerId: string, subscriptionId: string): Promise<User>;
  
  // Admin management
  getAdministrators(): Promise<User[]>;
  getAdminById(id: number): Promise<User | undefined>;
  
  // Client management
  getClientsByAdmin(adminId: number): Promise<(Client & { user: User })[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClientLastActive(userId: number): Promise<void>;
  
  // Project management
  getProjectsByClient(clientId: number): Promise<Project[]>;
  getProjectsByAdmin(adminId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project>;
  
  // Service management
  getServicesByAdmin(adminId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  
  // Subscription management
  getSubscriptionByUser(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription>;
  
  // Meeting management
  getMeetingsByClient(clientId: number): Promise<Meeting[]>;
  getMeetingsByAdmin(adminId: number): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  
  // Analytics
  getStats(): Promise<{
    totalAdmins: number;
    totalClients: number;
    monthlyRevenue: number;
    activeSubscriptions: number;
  }>;
  
  getAdminStats(adminId: number): Promise<{
    totalClients: number;
    activeProjects: number;
    monthlyRevenue: number;
    satisfaction: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private clients: Map<number, Client> = new Map();
  private projects: Map<number, Project> = new Map();
  private services: Map<number, Service> = new Map();
  private subscriptions: Map<number, Subscription> = new Map();
  private meetings: Map<number, Meeting> = new Map();
  
  private currentUserId = 1;
  private currentClientId = 1;
  private currentProjectId = 1;
  private currentServiceId = 1;
  private currentSubscriptionId = 1;
  private currentMeetingId = 1;

  constructor() {
    // Create super admin
    this.createUser({
      username: "superadmin",
      email: "admin@saasplatform.com",
      password: "password123",
      role: "super_admin",
      businessName: "SaaS Platform",
      isActive: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "client",
      adminId: insertUser.adminId || null,
      stripeCustomerId: insertUser.stripeCustomerId || null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId || null,
      businessName: insertUser.businessName || null,
      bio: insertUser.bio || null,
      heroDescription: insertUser.heroDescription || null,
      contactEmail: insertUser.contactEmail || null,
      contactPhone: insertUser.contactPhone || null,
      contactLocation: insertUser.contactLocation || null,
      isActive: insertUser.isActive !== undefined ? insertUser.isActive : true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(id: number, customerId: string, subscriptionId: string): Promise<User> {
    return this.updateUser(id, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    });
  }

  async getAdministrators(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === "admin");
  }

  async getAdminById(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    return user?.role === "admin" ? user : undefined;
  }

  async getClientsByAdmin(adminId: number): Promise<(Client & { user: User })[]> {
    const adminClients = Array.from(this.clients.values()).filter(client => client.adminId === adminId);
    return adminClients.map(client => {
      const user = this.users.get(client.userId)!;
      return { ...client, user };
    });
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const newClient: Client = {
      ...client,
      id,
      lastActiveAt: client.lastActiveAt || null,
      createdAt: new Date(),
    };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClientLastActive(userId: number): Promise<void> {
    const client = Array.from(this.clients.values()).find(c => c.userId === userId);
    if (client) {
      client.lastActiveAt = new Date();
      this.clients.set(client.id, client);
    }
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.clientId === clientId);
  }

  async getProjectsByAdmin(adminId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.adminId === adminId);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const newProject: Project = {
      ...project,
      id,
      status: project.status || "planning",
      description: project.description || null,
      progress: project.progress || 0,
      deadline: project.deadline || null,
      createdAt: new Date(),
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) throw new Error("Project not found");
    
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async getServicesByAdmin(adminId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => service.adminId === adminId);
  }

  async createService(service: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const newService: Service = {
      ...service,
      id,
      description: service.description || null,
      isActive: service.isActive !== undefined ? service.isActive : true,
      createdAt: new Date(),
    };
    this.services.set(id, newService);
    return newService;
  }

  async getSubscriptionByUser(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(sub => sub.userId === userId);
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentSubscriptionId++;
    const newSubscription: Subscription = {
      ...subscription,
      id,
      stripeSubscriptionId: subscription.stripeSubscriptionId || null,
      currentPeriodStart: subscription.currentPeriodStart || null,
      currentPeriodEnd: subscription.currentPeriodEnd || null,
      createdAt: new Date(),
    };
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) throw new Error("Subscription not found");
    
    const updatedSubscription = { ...subscription, ...updates };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async getMeetingsByClient(clientId: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(meeting => meeting.clientId === clientId);
  }

  async getMeetingsByAdmin(adminId: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(meeting => meeting.adminId === adminId);
  }

  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const id = this.currentMeetingId++;
    const newMeeting: Meeting = {
      ...meeting,
      id,
      type: meeting.type || "video",
      createdAt: new Date(),
    };
    this.meetings.set(id, newMeeting);
    return newMeeting;
  }

  async getStats(): Promise<{
    totalAdmins: number;
    totalClients: number;
    monthlyRevenue: number;
    activeSubscriptions: number;
  }> {
    const admins = this.getAdministrators();
    const totalAdmins = (await admins).length;
    const totalClients = Array.from(this.clients.values()).length;
    const activeSubscriptions = Array.from(this.subscriptions.values()).filter(sub => sub.status === "active").length;
    const monthlyRevenue = Array.from(this.subscriptions.values())
      .filter(sub => sub.status === "active")
      .reduce((sum, sub) => sum + parseFloat(sub.amount), 0);

    return {
      totalAdmins,
      totalClients,
      monthlyRevenue,
      activeSubscriptions,
    };
  }

  async getAdminStats(adminId: number): Promise<{
    totalClients: number;
    activeProjects: number;
    monthlyRevenue: number;
    satisfaction: number;
  }> {
    const clients = await this.getClientsByAdmin(adminId);
    const projects = await this.getProjectsByAdmin(adminId);
    const activeProjects = projects.filter(p => p.status === "in_progress").length;
    
    // Calculate revenue from admin's subscription
    const adminUser = await this.getUser(adminId);
    const subscription = adminUser ? await this.getSubscriptionByUser(adminUser.id) : null;
    const monthlyRevenue = subscription && subscription.status === "active" ? parseFloat(subscription.amount) : 0;

    return {
      totalClients: clients.length,
      activeProjects,
      monthlyRevenue,
      satisfaction: 4.8, // Mock satisfaction score
    };
  }
}

class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async updateUserStripeInfo(id: number, customerId: string, subscriptionId: string): Promise<User> {
    return this.updateUser(id, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    });
  }

  // Admin management
  async getAdministrators(): Promise<User[]> {
    const result = await db.select().from(users).where(eq(users.role, "admin"));
    
    // Get client count and subscription info for each admin
    const adminsWithStats = await Promise.all(
      result.map(async (admin) => {
        const clientCount = await db
          .select({ count: count() })
          .from(clients)
          .where(eq(clients.adminId, admin.id));

        const subscription = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, admin.id));

        return {
          ...admin,
          clientCount: clientCount[0].count,
          subscription: subscription[0] || null,
        };
      })
    );

    return adminsWithStats;
  }

  async getAdminById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0]?.role === "admin" ? result[0] : undefined;
  }

  // Client management
  async getClientsByAdmin(adminId: number): Promise<(Client & { user: User })[]> {
    const result = await db
      .select()
      .from(clients)
      .innerJoin(users, eq(clients.userId, users.id))
      .where(eq(clients.adminId, adminId));

    return result.map(({ clients: client, users: user }) => ({
      ...client,
      user,
    }));
  }

  async createClient(client: InsertClient): Promise<Client> {
    const result = await db.insert(clients).values(client).returning();
    return result[0];
  }

  async updateClientLastActive(userId: number): Promise<void> {
    await db
      .update(clients)
      .set({ lastActiveAt: new Date() })
      .where(eq(clients.userId, userId));
  }

  // Project management
  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.clientId, clientId));
  }

  async getProjectsByAdmin(adminId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.adminId, adminId));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project> {
    const result = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return result[0];
  }

  // Service management
  async getServicesByAdmin(adminId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.adminId, adminId));
  }

  async createService(service: InsertService): Promise<Service> {
    const result = await db.insert(services).values(service).returning();
    return result[0];
  }

  // Subscription management
  async getSubscriptionByUser(userId: number): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return result[0];
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions).values(subscription).returning();
    return result[0];
  }

  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription> {
    const result = await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id)).returning();
    return result[0];
  }

  // Meeting management
  async getMeetingsByClient(clientId: number): Promise<Meeting[]> {
    return await db.select().from(meetings).where(eq(meetings.clientId, clientId));
  }

  async getMeetingsByAdmin(adminId: number): Promise<Meeting[]> {
    return await db.select().from(meetings).where(eq(meetings.adminId, adminId));
  }

  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const result = await db.insert(meetings).values(meeting).returning();
    return result[0];
  }

  // Analytics
  async getStats(): Promise<{
    totalAdmins: number;
    totalClients: number;
    monthlyRevenue: number;
    activeSubscriptions: number;
  }> {
    const [adminCount, clientCount, subscriptionCount] = await Promise.all([
      db.select({ count: count() }).from(users).where(eq(users.role, "admin")),
      db.select({ count: count() }).from(clients),
      db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.status, "active")),
    ]);

    return {
      totalAdmins: adminCount[0].count,
      totalClients: clientCount[0].count,
      monthlyRevenue: 0, // Calculate based on active subscriptions
      activeSubscriptions: subscriptionCount[0].count,
    };
  }

  async getAdminStats(adminId: number): Promise<{
    totalClients: number;
    activeProjects: number;
    monthlyRevenue: number;
    satisfaction: number;
  }> {
    const [clientCount, projectCount] = await Promise.all([
      db.select({ count: count() }).from(clients).where(eq(clients.adminId, adminId)),
      db.select({ count: count() }).from(projects).where(eq(projects.adminId, adminId)),
    ]);

    return {
      totalClients: clientCount[0].count,
      activeProjects: projectCount[0].count,
      monthlyRevenue: 0,
      satisfaction: 95,
    };
  }
}

// Use DatabaseStorage if DATABASE_URL is available, otherwise use MemStorage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
