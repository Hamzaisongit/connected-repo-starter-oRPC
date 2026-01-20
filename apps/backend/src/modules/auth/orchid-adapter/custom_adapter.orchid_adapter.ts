import { sql } from "@backend/db/base_table";
import type { Db } from "@backend/db/db";
import { applyJoins } from "@backend/modules/auth/orchid-adapter/join_query_builder.orchid_adapter";
import { validateModel, validateSelect } from "@backend/modules/auth/orchid-adapter/model_table_map.orchid_adapter";
import { applyBetterAuthWhere } from "@backend/modules/auth/orchid-adapter/where_query_builder.orchid_adapter";
 import type { AdapterFactoryCustomizeAdapterCreator } from "@better-auth/core/db/adapter";
 import { sessionLogger } from '@backend/utils/session-logger.utils';

export const createCustomAdapterOrchid = (db: Db): AdapterFactoryCustomizeAdapterCreator =>
  () => ({
    // @ts-expect-error
    create: async ({ model, data, select }) => {
      const modelName = validateModel(model);
      const validatedSelect = validateSelect(modelName, select);
      
       sessionLogger.debug(`Adapter: create ${modelName}`, null, {
         operation: 'create',
         model: modelName,
         dataKeys: Object.keys(data),
         selectFields: validatedSelect,
       });

      const result = await db[modelName]
        .create(data)
        // @ts-expect-error
        .select(...validatedSelect);

      // Track session creation in Sentry - CRITICAL for session leakage detection
      if (modelName === 'sessions' && result) {
        const sessionData = result as any;
         sessionLogger.debug('Session created in database', sessionData, {
           operation: 'create',
           model: 'sessions',
           // SESSION LEAKAGE: Track creation fingerprint for later correlation
           sessionCreationFingerprint: `${sessionData.ipAddress}:${sessionData.userAgent?.substring(0, 20) || 'unknown'}`,
         });
      }

      return result;
    },
    update: async ({ model, where, update: values }) => {
      const modelName = validateModel(model);
      
       sessionLogger.debug(`Adapter: update ${modelName}`, null, {
         operation: 'update',
         model: modelName,
         whereClause: JSON.stringify(where),
         updateKeys: values ? Object.keys(values as object) : [],
       });

      const query = applyBetterAuthWhere(db[modelName], where);
      const result = await query.take().selectAll().update(values);

      if (modelName === 'sessions' && result) {
         sessionLogger.debug('Session updated in database', result, {
           operation: 'update',
           model: 'sessions',
           updatedFields: values ? Object.keys(values as object) : [],
         });
      }

      return result;
    },
    updateMany: async ({ model, where, update: values }) => {
      const modelName = validateModel(model);

      sessionLogger.debug(`Adapter: updateMany ${modelName}`, null, {
        operation: 'updateMany',
        model: modelName,
        whereClause: JSON.stringify(where),
        updateKeys: values ? Object.keys(values as object) : [],
      });

      const query = applyBetterAuthWhere(db[modelName], where);
      const results = await query.selectAll().update(values);

      if (modelName === 'sessions' && Array.isArray(results)) {
         sessionLogger.debug(`Updated ${results.length} sessions in database`, null, {
           operation: 'updateMany',
           model: 'sessions',
           count: results.length,
         });
      }

      return results;
    },
    delete: async ({ model, where }) => {
      const modelName = validateModel(model);
      
       sessionLogger.debug(`Adapter: delete ${modelName}`, null, {
         operation: 'delete',
         model: modelName,
         whereClause: JSON.stringify(where),
       });

      const query = applyBetterAuthWhere(db[modelName], where);
      const result = await query.delete();

      if (modelName === 'sessions') {
         sessionLogger.debug('Session deleted from database', null, {
           operation: 'delete',
           model: 'sessions',
           deletedCount: Array.isArray(result) ? result.length : 1,
         });
      }

      return result;
    },
    findOne: async ({ model, where, select, join }) => {
      const modelName = validateModel(model);
      const validatedSelect = validateSelect(modelName, select);
      
       sessionLogger.debug(`Adapter: findOne ${modelName}`, null, {
         operation: 'findOne',
         model: modelName,
         whereClause: JSON.stringify(where),
         selectFields: validatedSelect,
         hasJoins: !!join,
         joinModels: join ? Object.keys(join) : [],
       });

      const query = applyBetterAuthWhere(db[modelName], where);
      
      // Apply joins and get the select fields
      const joinedQuery = applyJoins(query, join, db);
      
      const result = await joinedQuery.select(...validatedSelect).takeOptional();

      // Track session retrieval in Sentry
      if (modelName === 'sessions') {
        sessionLogger[result ? 'debug' : 'warn'](result ? 'Session retrieved from database' : 'Session NOT FOUND in database', result, {
          operation: 'findOne',
          model: 'sessions',
          whereClause: JSON.stringify(where),
          found: !!result,
          hasJoins: !!join,
          joinModels: join ? Object.keys(join) : [],
          // Check if joined data exists
          hasJoinedUser: !!(result as any).user,
          joinedUserData: (result as any).user ? {
            userId: (result as any).user.id,
            userEmail: (result as any).user.email,
          } : undefined,
        });
      }

      return result;
    },
    findMany: async ({ model, where, sortBy, limit, offset, join }) => {
      const modelName = validateModel(model);
      
      sessionLogger.debug(`Adapter: findMany ${modelName}${join ? ' WITH JOINS' : ''}`, null, {
        operation: 'findMany',
        model: modelName,
        whereClause: JSON.stringify(where),
        sortBy: sortBy ? `${sortBy.field} ${sortBy.direction}` : undefined,
        limit,
        offset,
        hasJoins: !!join,
        joinModels: join ? Object.keys(join) : [],
      });

      let query = applyBetterAuthWhere(db[modelName], where);
      
      if (sortBy) {
        query = query.order({
          [sortBy.field]: sortBy.direction.toLowerCase() === "asc" ? "ASC" : "DESC",
        });
      }

      if (limit !== undefined) {
        query = query.limit(limit);
      }

      if (offset !== undefined) {
        query = query.offset(offset);
      }
      
      // Apply joins and get the select fields
      const joinedQuery = applyJoins(query, join, db);
      
      const results = await joinedQuery.selectAll();

      if (modelName === 'sessions' && Array.isArray(results)) {
        sessionLogger.debug(`Found ${results.length} sessions in database`, null, {
          operation: 'findMany',
          model: 'sessions',
          count: results.length,
          hasJoins: !!join,
          firstSessionTokenPrefix: results[0] ? (results[0] as any).token?.substring(0, 8) : undefined,
        });
      }

      return results;
    },
    count: async ({ model, where }) => {
      const modelName = validateModel(model);
      
      sessionLogger.debug(`Adapter: count ${modelName}`, null, {
        operation: 'count',
        model: modelName,
        whereClause: JSON.stringify(where),
      });

      const query = applyBetterAuthWhere(db[modelName], where);
      const count = await query.count();

      if (modelName === 'sessions') {
        sessionLogger.debug(`Counted ${count} sessions`, null, {
          operation: 'count',
          model: 'sessions',
          count,
        });
      }

      return count;
    },
    deleteMany: async ({ model, where }) => {
      const modelName = validateModel(model);
      
      sessionLogger.debug(`Adapter: deleteMany ${modelName}`, null, {
        operation: 'deleteMany',
        model: modelName,
        whereClause: JSON.stringify(where),
        isSoftDelete: model === 'sessions',
      });

      const query = applyBetterAuthWhere(db[modelName], where);
      
      if( model === "sessions") {
        const results = await query.update({
          markedInvalidAt: sql`CURRENT_TIMESTAMP`
        });

        // SESSION LEAKAGE: Track session invalidation (logout events)
        sessionLogger.debug('Invalidated sessions in database', null, {
          operation: 'invalidateSessions',
          model: 'sessions',
          softDelete: true,
          count: Array.isArray(results) ? results.length : 1,
          // This helps detect if sessions are being invalidated but still used
          invalidationReason: 'logout_or_session_cleanup',
        });

        return results;
      }
      
      const results = await query.delete();

      sessionLogger.debug(`Deleted ${Array.isArray(results) ? results.length : 'unknown'} ${modelName} records`, null, {
        operation: 'deleteMany',
        model: modelName,
        count: Array.isArray(results) ? results.length : undefined,
      });

      return results;
    }
  });