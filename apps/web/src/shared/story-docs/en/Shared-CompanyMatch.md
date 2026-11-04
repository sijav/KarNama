The box at the top of a job opportunity's related people tab when someone from
its company is in the network but not linked to it: a light blue panel whose
first line says how many people from the company are in the network, and under
it each of them, their name over their role and company, with Connect at the
other end. Connect links them to the job opportunity, and the screen takes
them off the list; with nobody left, or nobody at all, there is no box.

The box is a group named by its first line, and each person a group named by
them, so each Connect is heard with whose it is.

## Props

### company

The job opportunity's company, said in the first line.

### people

The people from that company in the network and not linked to the job
opportunity, each with an `id`, a `name`, and optionally a `role` and a
`company`; empty for none, when nothing is drawn.

### onConnect

Called with the person's `id` when their Connect is pressed.

## Stories

### Default

The box measured against the design, with one person.

### Connect

Connect pressed with a pointer, then with the keyboard.

### Several

Two people from the company, counted in the plural, one under the other.

### Nobody

Nobody from the company in the network: no box.

### LongName

The longest name on a phone, its role and company cut short and Connect whole.

### InEnglish

The same box in English, read from the left.

### Dark

The box in the dark scheme, in the theme's dark colours.
