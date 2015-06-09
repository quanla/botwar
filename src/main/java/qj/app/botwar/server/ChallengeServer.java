package qj.app.botwar.server;

import qj.ac.deploy.DeployUtil;
import qj.tool.web.HttpServer;
import qj.util.FileUtil;
import qj.util.LangUtil;
import qj.util.PropertiesUtil;
import qj.util.ThreadUtil;
import qj.util.funct.F1;
import qj.util.funct.Fs;
import qj.util.funct.P0;

import java.io.File;
import java.util.LinkedList;

/**
 * Created by quan on 6/7/2015.
 */
public class ChallengeServer {

    public static void main(String[] args) throws Exception {

        startServer();
    }

    public static class Development {
        public static void main(String[] args) throws Exception {
            String pkg = "qj.app.botwar.server.challenge.service";
            StringBuilder classes = new StringBuilder();
            LangUtil.eachClass(pkg, null, (c) -> {
                classes.append(c.getName() + "\n");
            });
            FileUtil.writeToFile(classes.toString(), new File("data/build/service-class-names.txt"));

            startServer();
        }
    }

    private static void startServer() throws Exception {
        int port = 1006;

        LinkedList<P0> stops = new LinkedList<>();

        ChallengeServlets.ChallengeServlet JsonServlet = ChallengeServlets.createServlet(PropertiesUtil.loadPropertiesFromFile("botwar-server.properties"));
        stops.add(JsonServlet::close);
        stops.add(new HttpServer()
                .addServlet("/",
                        JsonServlet
                )
                .start(port));

        qj.util.SystemUtil.onReturn((line) -> {
            if (line.equals("")) {
                Fs.invokeAll(stops);
                ThreadUtil.sleep(500);
                System.exit(0);
            }
        });
    }

    public static class Deploy {

        static String host = "54.254.246.157";
        static String key = "mf934jf2098a3";
        public static void main(String[] args) {
            DeployUtil.deploy("Botwar_Challenge", host + ":1213", key, deploy());
//            DeployUtil.restart("Botwar_Challenge", host + ":1213", key);
//            DeployUtil.stop("Botwar_Challenge", host + ":1213", key);
        }

        private static byte[] deploy() {

            byte[] content = DeployUtil.profile(ChallengeServer.class)
//                    .exclude((F1<File, Boolean>) (file) -> file.getName().contains("groovy"))
                    .toZipFile();
            return content;
        }
    }

}
