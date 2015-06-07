package qj.app.botwar.server;

import qj.tool.web.HttpServer;
import qj.util.ThreadUtil;
import qj.util.funct.Fs;
import qj.util.funct.P0;

import java.util.LinkedList;

/**
 * Created by quan on 6/7/2015.
 */
public class ChallengeServer {

    public static void main(String[] args) throws Exception {
        startServer();
    }

    private static void startServer() throws Exception {
        int port = 1006;

        LinkedList<P0> stops = new LinkedList<>();

        ChallengeServlets.ChallengeServlet JsonServlet = ChallengeServlets.createServlet();
        stops.add(JsonServlet::close);
        stops.add(new HttpServer()
                .addServlet("/",
                        JsonServlet
                )
                .start(port));

        qj.util.SystemUtil.onReturn((line) -> {
            if (line.equals("q")) {
                Fs.invokeAll(stops);
                ThreadUtil.sleep(500);
                System.exit(0);
            }
        });
    }

}
