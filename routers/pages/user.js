/**
 * Created by championswimmer on 13/03/17.
 */
const cel = require('connect-ensure-login');
const router = require('express').Router();

const passutils = require('../../utils/password');
const models = require('../../db/models').models;

router.get('/me',
  cel.ensureLoggedIn('/login'),
  function (req, res, next) {

    models.User.findOne({
      where: {id: req.user.id},
      include: [
        models.UserGithub,
        models.UserFacebook,
        models.UserLms,
        models.UserTwitter
      ]
    }).then(function (user) {
      if (!user) {
        res.redirect('/login')
      }
      return res.render('user/me', {user: user})
    }).catch(function(err) {
      throw err;
    });

  });

router.get('/me/edit',
  cel.ensureLoggedIn('/login'),
  function (req, res, next) {

    models.User.findOne({
      where: {id: req.user.id},
    }).then(function (user) {
      if (!user) {
        res.redirect('/login')
      }
      return res.render('user/me/edit', {user: user})
    }).catch(function(err) {
      throw err;
    });

  })

router.post('/me/edit',
  cel.ensureLoggedIn('/login'),
  function (req, res, next) {

    if ((req.body.password) && (req.body.password !== req.body.repassword)) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('edit')
    }

    models.User.update({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
      },
      {
        where: {id: req.user.id},
        returning: true
      }).then(function (result) {
      if (req.body.password) {
        passutils.pass2hash(req.body.password).then(function (passhash) {
          models.UserLocal.update({
            password: passhash
          }, {
            where: {userId: req.user.id}
          }).then(function(updated) {
            return res.redirect('../me')
          })
        })
      } else {
        return res.redirect('../me')
      }
    }).catch(function(err) {
      throw err
    });

  })


module.exports = router;