package qj.app.botwar.server;

import com.google.gson.Gson;
import qj.app.botwar.server.challenge.Post;
import qj.app.botwar.server.challenge.Url;
import qj.util.IOUtil;
import qj.util.LangUtil;
import qj.util.ReflectUtil;
import qj.util.funct.F1;
import qj.util.funct.P1;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.Objects;

/**
 * Created by quan on 6/7/2015.
 */
public class ChallengeServlets {

    public static ChallengeServlet createServlet() {

        ChallengeServlet challengeServlet = new ChallengeServlet() {

            @Override
            public void close() {

            }
        };

        String pkg = "qj.app.botwar.server.challenge.action";
        resolveActions(pkg, challengeServlet::addAction);


        return challengeServlet;
    }

    public static abstract class ChallengeServlet extends JsonServlet implements Closeable {
    }

    public static class JsonServlet extends HttpServlet {
        LinkedList<JsonAction> actions = new LinkedList<>();

        public void addAction(JsonAction action) {
            actions.add(action);
        }

        @Override
        protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
            if (Objects.equals(req.getMethod(), "OPTIONS")) {
                resp.addHeader("Access-Control-Allow-Origin", "*");
                resp.addHeader("Access-Control-Allow-Headers", "origin, content-type, accept");
                resp.addHeader("Access-Control-Allow-Credentials", "true");
                System.out.println(1111111);
                return;
            }



            String requestURI = req.getRequestURI();
            for (JsonAction action : actions) {
                if (Objects.equals(action.url, requestURI)) {
                    Gson gson = new Gson();
                    ArrayList<Object> params = new ArrayList<>();
                    for (Class<?> requestParam : action.requestParams) {
                        Object param = gson.fromJson(new InputStreamReader(req.getInputStream()), requestParam);
                        params.add(param);
                    }
                    Object ret = action.exec.e(params.toArray());
                    if (ret != null) {
                        gson.toJson(ret, resp.getWriter());
                    }
                    return;
                }
            }
            resp.sendError(404);
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
        LangUtil.eachClass(pkg, (clazz) -> {
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
}
