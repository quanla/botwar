package qj.app.botwar.server;

import org.apache.commons.dbcp2.BasicDataSource;
import qj.tool.web.json.JsonServlet;
import qj.util.IOUtil;
import qj.util.funct.*;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Created by quan on 6/7/2015.
 */
public class ChallengeServlets {

    public static ChallengeServlet createServlet(Properties config) {
        DbPool dbPool = new DbPool(config);

        ChallengeServlet challengeServlet = new ChallengeServlet() {

            @Override
            public void close() {
                dbPool.closePool.e();
            }
        };

        challengeServlet.prepareResource(Connection.class, () -> {
            Connection connection = dbPool.getConnection.e();
            return new Douce<Connection,P0>(connection, () -> {
                IOUtil.close(connection);
            });
        });

        String pkg = "qj.app.botwar.server.challenge.action";
        JsonServlet.resolveActions(pkg, ChallengeServlet.class.getClassLoader(), challengeServlet::addAction);

        return challengeServlet;
    }

    public static abstract class ChallengeServlet extends JsonServlet implements Closeable {
    }


    static class DbPool {
        protected P0 closePool;
        public F0<Connection> getConnection;

        public DbPool(Properties config) {
            BasicDataSource ds = new BasicDataSource();
            ds.setDriverClassName(config.getProperty("db.driver"));
            ds.setUrl(config.getProperty("db.url"));
            ds.setUsername(config.getProperty("db.user"));
            ds.setPassword(config.getProperty("db.password"));

            getConnection = () -> {
                Connection conn = null;
                try {
                    conn = ds.getConnection();
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                }
                return conn;
            };

            closePool = () -> {
                try {
                    ds.close();
                } catch (SQLException e1) {
                    throw new RuntimeException(e1);
                }
            };
        }

    }
}


