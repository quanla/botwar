package qj.app.botwar.server;

import com.google.gson.Gson;
import org.apache.commons.dbcp2.BasicDataSource;
import qj.app.botwar.server.challenge.Post;
import qj.app.botwar.server.challenge.Url;
import qj.util.IOUtil;
import qj.util.LangUtil;
import qj.util.ReflectUtil;
import qj.util.ThreadUtil;
import qj.util.funct.*;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.*;

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
                System.out.println("Close conn");
                IOUtil.close(connection);
            });
        });

        String pkg = "qj.app.botwar.server.challenge.action";
        resolveActions(pkg, challengeServlet::addAction);


        return challengeServlet;
    }

    public static abstract class ChallengeServlet extends JsonServlet implements Closeable {
    }

    public static class JsonServlet extends HttpServlet {
        LinkedList<JsonAction> actions = new LinkedList<>();
        HashMap<Class<?>,F0<Douce<?,P0>>> resources = new HashMap<>();

        public void addAction(JsonAction action) {
            actions.add(action);
        }

        @Override
        protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
            if (Objects.equals(req.getMethod(), "OPTIONS")) {
                resp.addHeader("Access-Control-Allow-Origin", "*");
                resp.addHeader("Access-Control-Allow-Headers", "origin, content-type, accept");
                resp.addHeader("Access-Control-Allow-Credentials", "true");
                return;
            }

            String requestURI = req.getRequestURI();
            for (JsonAction action : actions) {
                if (Objects.equals(action.url, requestURI)) {
                    Gson gson = new Gson();

                    LinkedList<P0> afterExec = new LinkedList<>();
                    ArrayList<Object> params = new ArrayList<>();
                    for (Class<?> requestParam : action.requestParams) {
                        Douce<?,P0> param = createParam(req, gson, requestParam);
                        if (param.get2()!=null) {
                            afterExec.add(param.get2());
                        }
                        params.add(param.get1());
                    }
                    Object ret = action.exec.e(params.toArray());

                    Fs.invokeAll(afterExec);

                    if (ret != null) {
                        gson.toJson(ret, resp.getWriter());
                    }
                    return;
                }
            }
            resp.sendError(404);
        }

        private Douce<?,P0> createParam(HttpServletRequest req, Gson gson, Class<?> requestParam) throws IOException {
            F0<Douce<?, P0>> resource = resources.get(requestParam);
            if (resource != null) {
                return resource.e();
            }
            return new Douce<>(gson.fromJson(new InputStreamReader(req.getInputStream()), requestParam), null);
        }

        @SuppressWarnings("unchecked")
        public <R> void prepareResource(Class<R> clazz, F0<Douce<R,P0>> createResource) {
            F0 createResource1 = createResource;
            resources.put(clazz, createResource1);
        }
    }

    static class JsonAction {
        public String url;
        public String method;
        public Class<?>[] requestParams;
        public Class<?> response;
        public F1<Object[],Object> exec;
    }

    private static void resolveActions(String pkg, P1<JsonAction> p) {
        LangUtil.eachClass(pkg, ChallengeServlet.class.getClassLoader(), (clazz) -> {
            JsonAction jsonAction = new JsonAction();
            jsonAction.url = ((Url) clazz.getAnnotation(Url.class)).value();
            jsonAction.method = clazz.getAnnotation(Post.class) != null ? "POST" : "GET";


            Method method = ReflectUtil.getMethod("exec", clazz);


            jsonAction.requestParams = method.getParameterTypes();
            jsonAction.response = method.getReturnType();
            jsonAction.exec = (params) -> {
                Object action = ReflectUtil.newInstance4(clazz);
                return ReflectUtil.invoke(method, action, params);
            };
            p.e(jsonAction);
        });
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


