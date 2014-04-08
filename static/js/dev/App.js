/**
 * RedditBooru main app view (controller)
 */
(function(undefined) {

    // Amount of time to wait on user to stop making changes before firing off requests
    var UPDATE_DELAY = 1000,
        HAS_CONTENT = 'hasContent',
        HIDDEN = 'hidden';

    RB.AppView = Backbone.View.extend({

        views: {},
        collections: {},
        router: new RB.Router,

        $title: $('#title'),
        $sidebar: $('#supporting'),

        _delayTimer: null,

        initialize: function() {

            var sidebar = new RB.SidebarView();

            // Global collections
            this.collections = {
                sources: new RB.QueryOptionCollection(),
                images: new RB.ImageCollection()
            };

            // Bootstrap data
            this.collections.sources.reset(window.sources);
            this.collections.images.reset(window.startUp);

            // Views
            this.views = {
                sidebar: sidebar,
                sources: new RB.QueryOptionsView($('#sources'), this.collections.sources),
                images: new RB.ImageView($('#images'), this.collections.images),
                search: new RB.SearchView(sidebar, this.collections.images, this.router),
                user: new RB.UserView(sidebar, this.collections.images, this.router)
            };

            // TODO - move this into sources view controller
            this.views.sources.on('update', _.bind(this._handleSourcesUpdate, this));

            // Start the router
            Backbone.history.start({
                pushState: true
            });

        },

        _handleSourcesUpdate: function(item) {
            var collections = this.collections;
            clearTimeout(this._delayTimer);
            this._delayTimer = setTimeout(function() {
                var sources = collections.sources.where({ checked: true }),
                    updated = [];

                _.each(sources, function(item) {
                    updated.push(item.attributes.value);
                });

                collections.images.setQueryOption('sources', updated.join(','));
            }, UPDATE_DELAY);
        },

        setTitle: function(title) {
            if (title) {
                this.$title.html(title).removeClass(HIDDEN);
                document.title = title + ' - redditbooru';
            } else {
                this.$title.html('').addClass(HIDDEN);
                document.title = 'redditbooru - a place where cute girls come to meet';
            }
        },

        setSidebar: function(content) {
            if (content) {
                this.$sidebar.addClass(HAS_CONTENT).html(content);
            } else {
                this.$sidebar.removeClass(HAS_CONTENT).empty();
            }
            this.views.images.calculateWindowColumns();
        }

    });

    // Kick off execution
    RB.App = new RB.AppView();

}());