http://valjs.io

-----------------------------------------------------------

# jQuery ValJS

jQuery ValJS is a jQuery Form Validation library with focus on three main things

  - Easy configuration using JavaScript or HTML5-attributes
  - Validate parts of a form
  - Easy to extend with your own rules and custom event receivers

### Version

0.8.5 2015-01-12
- Added Remote rule

0.8 2015-01-10
- Rebuilt in preparation for future ajax support
- Many bug fixes

0.7 2014-12-31
- Completely rewritten code over a few weeks time
- This version will not be compatible with the johnny5-version
- Change of how CSS classes work (No longer Block Element Modifier by default)
- A lot of work to test and make rule configuration work as intended
- A lot of work has gone into preparing web site and documentation
- Todo: Browser compability tests
- Todo: Events
- Todo: Methods
- Todo: Custom rule overhaul
- Todo: Tests, tests, test...
0.1 - My "old" version called Johnny5. Don't use it. It's horrible....

### History

I began writing this library in the end of 2013 when I was in need of validating a single part of a form which resulted in the creation of of the library I called Johnny5. It does what I wanted it to at the time, but it was far from the working jQuery plugin that I wanted to create and it fails quickly when you start testing different options.

Now, after almost a year without having the time to actually create a working library I got the opportunity to finish my idea through my studies. During this year, the one thing I've kept thinking about is the name of the library - and I've renamed it to ValJS.

### Tech

ValJS requires the following libraries to work.

* [jQuery] >= V1.7

### Getting started

You need to include jQuery and ValJS

```sh
<script src="js/jquery.js"></script>
<script src="js/jquery.valjs.js"></script>
```

You need a HTML form - and yes, ValJS will recognize HTML5 field types such as 'email':

```sh
<form id="myform">

 <label for="email">E-mail:</label>
 <input type="email" id="email" name="email" />

 <div>
  <input type="submit" />
 </div>
</form>
```

Then you need to trigger ValJS for the form:

```sh
<script>
 $(function() {
  $('#myform').valjs();
 });
</script>
```

### Todo's

See http://valjs.io/docs/articles/about/changelog#future

...

License
----

MIT

**Free Software, Tru dat!**

[jQuery]:http://jquery.com
