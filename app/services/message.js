module.exports = function (models) {
  var logger = require('./logger').http,
    async = require('async');

  var createAttachments = function (message, attachments, done) {
    if (attachments === null) {
      return done(null, message);
    }
    models.message_attachment.create(attachments, function (err, attachments) {
      if (err) {
        return done(err);
      }
      message.setAttachments(attachments, function (err) {
        if (err) {
          return done(err);
        }
        return done(null);
      });
    });
  };

  var createRecipients = function (message, recipients, done) {
    models.message_recipient.create(recipients, function (err, recipients) {
      if (err) {
        logger.error('Error creating recipients', err);
        return done(err);
      }
      message.setRecipients(recipients, function (err) {
        if (err) {
          logger.error('Error settings recipients', err);
          return done(err);
        }
        return done(null);
      });
    });
  };

  var createCCs = function (message, ccs, done) {
    if (ccs === null) {
      return done(null);
    }
    models.message_cc.create(ccs, function (err, ccs) {
      if (err) {
        logger.error('Error creating CCs', err);
        return done(err);
      }
      message.setCcs(ccs, function (err) {
        if (err) {
          logger.error('Error settings CCs', err);
          return done(err);
        }
        return done(null);
      });
    });
  };

  var createHeaders = function (message, headers, done) {
    models.message_header.create(headers, function (err, headers) {
      if (err) {
        logger.error('Error crsssseating headers', err);
        return done(err);
      }
      message.setHeaders(headers, function (err) {
        if (err) {
          logger.error('Error settings headers', err);
          return done(err);
        }
        return done(null);
      });
    });
  };

  return {
    create: function (builder, done) {
      models.message.create(builder.getMessage(), function (err, message) {
        if (err) {
          logger.error('Create message error', err);
          return done(err);
        }
        async.series([
          function (callback) {
            createHeaders(message, builder.getHeaders(), function (err) {
              callback(err);
            });
          },
          function (callback) {
            createRecipients(message, builder.getRecipients(), function (err) {
              callback(err);
            });
          },
          function (callback) {
            createCCs(message, builder.getCCs(), function (err) {
              callback(err);
            });
          },
          function (callback) {
            createAttachments(message, builder.getAttachments(), function (err) {
              callback(err);
            });
          }
        ], function (err) {
          if (err) {
            logger.error('Error creating message', err);
            return done(err, message);
          }
          logger.info('Persisted message into database with id: ', message.id);
          return done(null, message);
        });
      });
    }
  };
};