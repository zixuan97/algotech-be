// const router = require('express').Router()
// let Grades = require('../models/grades/grades.model')

// router.route('/').get((req, res) => {
//     Grades.find()
//     .then(grades => res.json(grades))
//     .catch(err => res.status(400).json('Error ' + err))
// })

// router.route('/add').post((req, res) => {
//     const username = req.body.username
//     const mark = Number(req.body.mark)
//     const alphabetGrade = req.body.alphabetGrade
//     const date = Date.parse(req.body.date)

//     const newGrade = new Grades({
//         username,
//         mark,
//         alphabetGrade,
//         date
//     })

//     newGrade.save()
//     .then(()=> { res.json('Grades Added!')})
//     .catch(err => res.status(400).json('Error ' + err))
// })

// module.exports = router
