import {StateProvider} from "@uirouter/angularjs";
import {UrlStatesConstant} from "../../../constants/url-states.constant";
import {ICompileService, IQService, module} from 'angular';
import {ILazyLoad} from "oclazyload";

/* @ngInject */
export class MasterLayoutModule {

    //#region Constructors

    public constructor(private $stateProvider: StateProvider) {
        $stateProvider
            .state(UrlStatesConstant.masterLayout, {
                abstract: true,
                controller: 'masterLayoutController',
                templateProvider: ['$q', ($q: IQService) => {
                    // We have to inject $q service manually due to some reasons that ng-annotate cannot add $q service in production mode.
                    return $q((resolve) => {
                        // lazy load the view
                        require.ensure([], () => resolve(require('./master-layout.html')));
                    });
                }],
                resolve: {
                    /*
                    * Load login controller.
                    * */
                    loadController: ['$q', '$ocLazyLoad', ($q: IQService, $ocLazyLoad: ILazyLoad) => {
                        return $q((resolve) => {
                            require.ensure([], (require) => {
                                // load only controller module
                                let ngModule = module('shared.master-layout', []);

                                // Lazy load navigation bar.
                                const {NavigationBarDirective} = require('../../../directives/navigation-bar');
                                ngModule = ngModule.directive('navigationBar',
                                    ($q: IQService, $compile: ICompileService) => new NavigationBarDirective($q, $compile));

                                // Lazy load sidebar.
                                const {SidebarDirective} = require('../../../directives/side-bar');
                                ngModule = ngModule.directive('sideBar',
                                    ($q: IQService, $compile: ICompileService) => new SidebarDirective($q, $compile));

                                const {MasterLayoutController} = require('./master-layout.controller');

                                // Import controller file.
                                ngModule.controller('masterLayoutController', MasterLayoutController);
                                $ocLazyLoad.inject(ngModule.name);
                                resolve(ngModule.controller);
                            });
                        });
                    }]
                }
            });

    }

    //#endregion
}