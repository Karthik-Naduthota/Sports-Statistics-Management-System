// server.js
const express = require('express');
const cors = require('cors');
const { Op, Sequelize } = require('sequelize');
const { sequelize, Parent, Coach, Sport, Team, Student } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

// helper responses
function error(res, msg, code = 400) {
  return res.status(code).json({ error: msg });
}
function success(res, msg, code = 200) {
  return res.status(code).json({ message: msg });
}

(async () => {
await sequelize.sync();
})();

// --- STATS ---
app.get('/api/stats', async (req, res) => {
  try {
    const [students, coaches, sports, teams, parents, active_students] = await Promise.all([
      Student.count(),
      Coach.count(),
      Sport.count(),
      Team.count(),
      Parent.count(),
      Student.count({ where: { status: 'active' } })
    ]);
    res.json({ students, coaches, sports, teams, parents, active_students });
  } catch (err) {
    console.error(err);
    error(res, 'Failed to fetch stats', 500);
  }
});

// --- STUDENTS ---
app.get('/api/students', async (req, res) => {
  try {
    const search = req.query.search || '';
    const where = {};
    if (search) {
      const like = `%${search}%`;
      where[Op.or] = [
        Sequelize.where(Sequelize.fn('lower', Sequelize.col('Student.name')), 'LIKE', `%${search.toLowerCase()}%`),
        Sequelize.where(Sequelize.fn('lower', Sequelize.col('Student.email')), 'LIKE', `%${search.toLowerCase()}%`)
      ];
    }
    const students = await Student.findAll({
      where,
      include: [{ model: Parent }, { model: Team }],
      order: [['name', 'ASC']]
    });
    const rows = students.map(s => ({
      id: s.id,
      name: s.name,
      dob: s.dob,
      email: s.email,
      phone: s.phone,
      gender: s.gender,
      parent_id: s.parent_id,
      parent_name: s.Parent ? s.Parent.name : null,
      team_id: s.team_id,
      team_name: s.Team ? s.Team.name : null,
      enrollment_date: s.enrollment_date,
      status: s.status
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to fetch students', 500);
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.name) return error(res, 'Name is required');
    const student = await Student.create({
      name: data.name,
      dob: data.dob,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      parent_id: data.parent_id || null,
      team_id: data.team_id || null,
      status: data.status || 'active'
    });
    res.status(201).json(student);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to create student', 500);
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const s = await Student.findByPk(req.params.id, { include: [Parent, Team] });
    if (!s) return error(res, 'Student not found', 404);
    res.json({
      id: s.id, name: s.name, dob: s.dob, email: s.email, phone: s.phone, gender: s.gender,
      parent_id: s.parent_id, parent_name: s.Parent ? s.Parent.name : null,
      team_id: s.team_id, team_name: s.Team ? s.Team.name : null,
      enrollment_date: s.enrollment_date, status: s.status
    });
  } catch (err) {
    console.error(err);
    error(res, 'Failed to fetch student', 500);
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const s = await Student.findByPk(req.params.id);
    if (!s) return error(res, 'Student not found', 404);
    const data = req.body;
    ['name', 'dob', 'email', 'phone', 'gender', 'status'].forEach(f => {
      if (f in data) s[f] = data[f];
    });
    if ('parent_id' in data) s.parent_id = data.parent_id || null;
    if ('team_id' in data) s.team_id = data.team_id || null;
    await s.save();
    res.json(s);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to update student', 500);
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const s = await Student.findByPk(req.params.id);
    if (!s) return error(res, 'Student not found', 404);
    await s.destroy();
    success(res, 'Student deleted');
  } catch (err) {
    console.error(err);
    error(res, 'Failed to delete student', 500);
  }
});

// --- COACHES ---
app.get('/api/coaches', async (req, res) => {
  try {
    const search = req.query.search || '';
    const where = {};
    if (search) {
      where[Op.or] = [
        Sequelize.where(Sequelize.fn('lower', Sequelize.col('Coach.name')), 'LIKE', `%${search.toLowerCase()}%`),
        Sequelize.where(Sequelize.fn('lower', Sequelize.col('Coach.specialization')), 'LIKE', `%${search.toLowerCase()}%`)
      ];
    }
    const coaches = await Coach.findAll({ where, order: [['name','ASC']] });
    res.json(coaches);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to fetch coaches', 500);
  }
});

app.post('/api/coaches', async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.name) return error(res, 'Name is required');
    const coach = await Coach.create({
      name: data.name,
      specialization: data.specialization,
      experience: data.experience || 0,
      email: data.email,
      phone: data.phone,
      bio: data.bio
    });
    res.status(201).json(coach);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to create coach', 500);
  }
});

app.get('/api/coaches/:id', async (req, res) => {
  try {
    const c = await Coach.findByPk(req.params.id);
    if (!c) return error(res, 'Coach not found', 404);
    res.json(c);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to fetch coach', 500);
  }
});

app.put('/api/coaches/:id', async (req, res) => {
  try {
    const c = await Coach.findByPk(req.params.id);
    if (!c) return error(res, 'Coach not found', 404);
    const data = req.body;
    ['name','specialization','experience','email','phone','bio'].forEach(f => {
      if (f in data) c[f] = data[f];
    });
    await c.save();
    res.json(c);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to update coach', 500);
  }
});

app.delete('/api/coaches/:id', async (req, res) => {
  try {
    const c = await Coach.findByPk(req.params.id);
    if (!c) return error(res, 'Coach not found', 404);
    await c.destroy();
    success(res, 'Coach deleted');
  } catch (err) {
    console.error(err);
    error(res, 'Failed to delete coach', 500);
  }
});

// --- SPORTS ---
app.get('/api/sports', async (req, res) => {
  try {
    const search = req.query.search || '';
    const where = {};
    if (search) {
      where[Op.or] = [
        Sequelize.where(Sequelize.fn('lower', Sequelize.col('Sport.name')), 'LIKE', `%${search.toLowerCase()}%`),
        Sequelize.where(Sequelize.fn('lower', Sequelize.col('Sport.category')), 'LIKE', `%${search.toLowerCase()}%`)
      ];
    }
    const sports = await Sport.findAll({ where, order: [['name','ASC']] });
    res.json(sports);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to fetch sports', 500);
  }
});

app.post('/api/sports', async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.name) return error(res, 'Name is required');
    const sport = await Sport.create({
      name: data.name,
      category: data.category,
      description: data.description,
      max_team_size: data.max_team_size || 20
    });
    res.status(201).json(sport);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to create sport', 500);
  }
});

app.get('/api/sports/:id', async (req, res) => {
  try {
    const s = await Sport.findByPk(req.params.id);
    if (!s) return error(res, 'Sport not found', 404);
    res.json(s);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to fetch sport', 500);
  }
});

app.put('/api/sports/:id', async (req, res) => {
  try {
    const s = await Sport.findByPk(req.params.id);
    if (!s) return error(res, 'Sport not found', 404);
    const data = req.body;
    ['name','category','description','max_team_size'].forEach(f => {
      if (f in data) s[f] = data[f];
    });
    await s.save();
    res.json(s);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to update sport', 500);
  }
});

app.delete('/api/sports/:id', async (req, res) => {
  try {
    const s = await Sport.findByPk(req.params.id);
    if (!s) return error(res, 'Sport not found', 404);
    await s.destroy();
    success(res, 'Sport deleted');
  } catch (err) {
    console.error(err);
    error(res, 'Failed to delete sport', 500);
  }
});

// --- TEAMS ---
app.get('/api/teams', async (req, res) => {
  try {
    const search = req.query.search || '';
    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    const teams = await Team.findAll({ where, include: [Sport, Coach], order: [['name','ASC']] });
    const rows = teams.map(t => ({
      id: t.id, name: t.name, age_group: t.age_group,
      sport_id: t.sport_id, sport_name: t.Sport ? t.Sport.name : null,
      coach_id: t.coach_id, coach_name: t.Coach ? t.Coach.name : null,
      description: t.description, created_at: t.created_at, student_count: null // can expand if needed
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to fetch teams', 500);
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.name) return error(res, 'Name is required');
    const team = await Team.create({
      name: data.name,
      age_group: data.age_group,
      sport_id: data.sport_id || null,
      coach_id: data.coach_id || null,
      description: data.description
    });
    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to create team', 500);
  }
});

app.get('/api/teams/:id', async (req, res) => {
  try {
    const t = await Team.findByPk(req.params.id, { include: [Sport, Coach] });
    if (!t) return error(res, 'Team not found', 404);
    res.json(t);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to fetch team', 500);
  }
});

app.put('/api/teams/:id', async (req, res) => {
  try {
    const t = await Team.findByPk(req.params.id);
    if (!t) return error(res, 'Team not found', 404);
    const data = req.body;
    ['name','age_group','description'].forEach(f => { if (f in data) t[f] = data[f]; });
    if ('sport_id' in data) t.sport_id = data.sport_id || null;
    if ('coach_id' in data) t.coach_id = data.coach_id || null;
    await t.save();
    res.json(t);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to update team', 500);
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  try {
    const t = await Team.findByPk(req.params.id);
    if (!t) return error(res, 'Team not found', 404);
    await t.destroy();
    success(res, 'Team deleted');
  } catch (err) {
    console.error(err);
    error(res, 'Failed to delete team', 500);
  }
});

// --- PARENTS ---
app.get('/api/parents', async (req, res) => {
  try {
    const search = req.query.search || '';
    const where = {};
    if (search) {
      where[Op.or] = [
        Sequelize.where(Sequelize.fn('lower', Sequelize.col('Parent.name')), 'LIKE', `%${search.toLowerCase()}%`),
        Sequelize.where(Sequelize.fn('lower', Sequelize.col('Parent.email')), 'LIKE', `%${search.toLowerCase()}%`)
      ];
    }
    const parents = await Parent.findAll({ where, order: [['name','ASC']] });
    const rows = await Promise.all(parents.map(async p => {
      const count = await Student.count({ where: { parent_id: p.id } });
      return {
        id: p.id, name: p.name, phone: p.phone, email: p.email, address: p.address,
        created_at: p.created_at, student_count: count
      };
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to fetch parents', 500);
  }
});

app.post('/api/parents', async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.name) return error(res, 'Name is required');
    const parent = await Parent.create({
      name: data.name, phone: data.phone, email: data.email, address: data.address
    });
    res.status(201).json(parent);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to create parent', 500);
  }
});

app.get('/api/parents/:id', async (req, res) => {
  try {
    const p = await Parent.findByPk(req.params.id);
    if (!p) return error(res, 'Parent not found', 404);
    res.json(p);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to fetch parent', 500);
  }
});

app.put('/api/parents/:id', async (req, res) => {
  try {
    const p = await Parent.findByPk(req.params.id);
    if (!p) return error(res, 'Parent not found', 404);
    const data = req.body;
    ['name','phone','email','address'].forEach(f => { if (f in data) p[f] = data[f]; });
    await p.save();
    res.json(p);
  } catch (err) {
    console.error(err);
    error(res, 'Failed to update parent', 500);
  }
});

app.delete('/api/parents/:id', async (req, res) => {
  try {
    const p = await Parent.findByPk(req.params.id);
    if (!p) return error(res, 'Parent not found', 404);
    await p.destroy();
    success(res, 'Parent deleted');
  } catch (err) {
    console.error(err);
    error(res, 'Failed to delete parent', 500);
  }
});

// --- RUN ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});