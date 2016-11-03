## Dependencies

The dependencies of the project itself are managed with `bower`, the dependencies for the build/dev tasks are managed with `npm` modules.

A good way to start working on the project is to run:

`npm install` or `yarn`
`bower install`

## Development

To allow the fastest onboarding possible on this project, no build task is necessary to make it run.
Just starting a webserver with the folder `src` as root and a SPA strategy will allow you to run the website.

For convenience sake, a gulp task `watch` was created. It uses browser sync and reload the pages everytime a change is made.

## Building

To build for production, we use `gulp`.
Just run `gulp build`, the task will take care of bundling the files, taking care of creating shards for views and low usage components.
It also babelify the js, compress the HTML/CSS/JS and generate a service worker/appcache manifest.

This task also uses the env variable `NODE_ENV` to determine which config file to bundle. See `src/js/config.html`.

As for now, this website lives in parallel of the previous Kano World. To keep the same subdomain but show different websites, a server side logic
was configured. It means that to avoid conflict of assets, we need to put this website in a subfolder. This is why the build task also add the prefix `/new/` to all assets.
