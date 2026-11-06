import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    userId: {
      type: String,
      default: null,
    },
    userName: {
      type: String,
      required: true,
      default: "System User",
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      default: "Provincial Admin",
    },
    municipality: {
      type: String,
      default: "Provincial",
      index: true,
    },
    establishmentName: {
      type: String,
      default: null,
    },
    action: {
      type: String,
      required: true,
      index: true,
      // Examples: 'USER_LOGIN', 'USER_LOGOUT', 'SUBMIT_FORM', 'VISITOR_CHECKIN', 'REGISTER_ESTABLISHMENT', 'REGISTER_MUNICIPAL', 'DATA_RESET', 'EXPORT_REPORT'
    },
    module: {
      type: String,
      required: true,
      default: "System",
      // Examples: 'Authentication', 'Submissions', 'Establishments', 'Visitors', 'Reports', 'System'
    },
    details: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Success", "Failed", "Warning"],
      default: "Success",
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ municipality: 1, action: 1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;

