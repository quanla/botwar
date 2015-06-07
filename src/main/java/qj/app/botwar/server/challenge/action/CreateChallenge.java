package qj.app.botwar.server.challenge.action;

import qj.app.botwar.server.challenge.Post;
import qj.app.botwar.server.challenge.Url;
import qj.app.botwar.server.challenge.model.Challenge;

/**
 * Created by quan on 6/7/2015.
 */
@Url("/challenge")
@Post
public class CreateChallenge {
    public void exec(Challenge challenge) {
        System.out.println(challenge);
    }
}

