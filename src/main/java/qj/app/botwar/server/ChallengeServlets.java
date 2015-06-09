package qj.app.botwar.server;

import org.apache.commons.dbcp2.BasicDataSource;
import qj.app.botwar.server.challenge.model.Authen;
import qj.tool.web.json.JsonServlet;
import qj.util.FileUtil;
import qj.util.IOUtil;
import qj.util.LangUtil;
import qj.util.funct.*;

import java.io.File;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Arrays;
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

        challengeServlet.prepareResource(Connection.class, (req) -> {
            Connection connection = dbPool.getConnection.e();
            return new Douce<Connection,P0>(connection, () -> {
                IOUtil.close(connection);
            });
        });

        challengeServlet.prepareResource(Authen.class, (req) -> {
            String authenType = req.getHeader("Authen-Type");
            String authenId = req.getHeader("Authen-Id");
            String authenUsername = req.getHeader("Authen-Username");
            String authenEmail = req.getHeader("Authen-Email");

            if (authenType != null && authenId != null && authenUsername != null && authenEmail != null) {
                return new Douce<Authen,P0>(new Authen(authenType, authenId, authenUsername, authenEmail), null);
            } else {
                return null;
            }

        });


        Arrays.asList(FileUtil.readFileToString(new File("data/build/service-class-names.txt")).split("\\s+|\r?\n")).forEach((cName) -> {
            try {
                JsonServlet.resolveActions(ChallengeServlet.class.getClassLoader().loadClass(cName), challengeServlet::addAction);
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }
        });

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


