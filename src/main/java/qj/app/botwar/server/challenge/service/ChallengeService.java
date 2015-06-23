package qj.app.botwar.server.challenge.service;

import qj.app.botwar.server.AuthorizationException;
import qj.app.botwar.server.challenge.model.Authen;
import qj.app.botwar.server.challenge.model.Challenge;
import qj.app.botwar.server.challenge.model.ChallengeReply;
import qj.tool.sql.Builder;
import qj.tool.sql.SQLUtil;
import qj.tool.sql.Template;
import qj.tool.web.json.*;

import java.sql.Connection;
import java.util.Date;
import java.util.Objects;

import static qj.app.botwar.server.challenge.service.ChallengesService.template;

/**
 * Created by quan on 6/7/2015.
 */
@Url("/challenge/:challengeId")
public class ChallengeService {
    @Get
    public Challenge get(@UrlParam("challengeId") Long challengeId, Connection conn) {
        return template.selectById(challengeId, conn);
    }

    @Delete
    public void delete(@UrlParam("challengeId") Long challengeId, Authen authen, Connection conn) {
        Challenge challenge = template.selectById(challengeId, conn);
        if (
                Objects.equals(challenge.fromAuthenType, authen.type)
                && Objects.equals(challenge.fromId, authen.id)
        ) {
            template.deleteById(challengeId, conn);
        } else {
            throw new AuthorizationException();
        }
    }

    @Put
    @Url("/challenge/:challengeId/plusone/:state")
    public int plusone(@UrlParam("challengeId") Long challengeId, @UrlParam("state") String state, Connection conn) {
        Challenge challenge = template.select(conn, "SELECT id, plusone WHERE id=?", challengeId);
        challenge.plusone += "on".equals(state) ? 1 : -1;
        template.update(challenge, "plusone", conn);
        return challenge.plusone;
    }


//    public static Template<Challenge> template = new Builder<>(Challenge.class)
//            .embeded("challengeSetup")
//            .build();

    @Get
    @Url("/challenge/:challengeId/count_replies")
    public Long countReplies(@UrlParam("challengeId") Long challengeId, Connection conn) {
        return SQLUtil.selectLong(conn, "SELECT count(*) FROM challenge_reply WHERE challenge_reply.to_challenge = ?", challengeId);
    }


    public static Template<ChallengeReply> templateReply = new Builder<>(ChallengeReply.class)
            .embeded("bot")
            .build();

    @Post
    @Url("/challenge/:challengeId/reply")
    public void postReply(ChallengeReply challengeReply, Authen authen, Connection conn) {
        challengeReply.fromAuthenType = authen.type;
        challengeReply.fromId = authen.id;
        challengeReply.fromName = authen.username;
        challengeReply.fromEmail = authen.email;
        challengeReply.createTime = new Date();

        templateReply.insert(challengeReply, conn);
    }

    @Get
    @Url("/challenge/:challengeId/reply")
    public ChallengeReply getReply(@UrlParam("challengeId") Long challengeId, Connection conn) {
        return templateReply.select(conn, "WHERE to_challenge=? ORDER BY create_time DESC", challengeId);
    }

    @Get
    @Url("/challenge/:challengeId/next_reply/:replyId")
    public ChallengeReply getNextReply(@UrlParam("challengeId") Long challengeId, @UrlParam("replyId") Long replyId, Connection conn) {
        ChallengeReply challengeReply = templateReply.selectById(replyId, conn);
        return templateReply.select(conn, "WHERE to_challenge=? AND create_time < ? ORDER BY create_time DESC", challengeId, challengeReply.createTime);
    }

    @Get
    @Url("/challenge/:challengeId/prev_reply/:replyId")
    public ChallengeReply getPrevReply(@UrlParam("challengeId") Long challengeId, @UrlParam("replyId") Long replyId, Connection conn) {
        ChallengeReply challengeReply = templateReply.selectById(replyId, conn);
        return templateReply.select(conn, "WHERE to_challenge=? AND create_time > ? ORDER BY create_time ASC", challengeId, challengeReply.createTime);
    }
}

