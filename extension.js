/*
 *   Copyright (c) 2017-2018, Timo Pylvanainen <tpyl@iki.fi>
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the GNOME nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY
 *  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 *  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *  Latest version available at https://github.com/tpyl/gssnaptoneighbors
 */
const Gio = imports.gi.Gio;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const St = imports.gi.St;

const Main = imports.ui.main;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const OVERLAP_TOLERANCE = 5;
const SCAN_BOX_SIZE = 50;

/**
 * Return all windows on the currently active workspace
 */
function getWindowsOnActiveWorkspace() {
    let windows = [];
    let windowActors = global.get_window_actors();

    let curWorkSpace = global.workspaceManager.get_active_workspace();

    for (let i = 0; i < windowActors.length; i++) {
        let win = windowActors[i].meta_window;
        if(win.located_on_workspace(curWorkSpace) &&
            !win.minimized && 
            win.get_frame_type() == 0) {
            windows.push(win);
        }
    }

    return windows;
}

/**
 * Find the maximum horzontal expansion from x and
 * returns minx, maxx. The initial maximum x is given
 * as argument, and the expansion is never larger than 
 * that. 
 *
 * The upper and lower limits define the y coordinate
 * range to check for overlapping windows. 
 */
function expandHorizontally(x, upper, lower, minx, maxx, windows) {

    for (let i = 0; i < windows.length; i++) {
        let rect = windows[i].get_frame_rect();
        
        let wt = rect.y;
        let wb = rect.y + rect.height;
        let wl = rect.x;
        let wr = rect.x + rect.width;

        // Check only  if the window overlaps vertically
        if(wb > upper && wt  < lower) {
            if(wr < x && minx < wr) {
                minx = wr;
            }
            if(wl > x && wl < maxx) {
                maxx = wl;
            }
        }
    }

    return {min: minx, max: maxx};
}


/**
 * Find the maximum vertical expansion from  y, and
 * returns miny, maxy. The initial maximum y is given
 * as argument, and the expansion is never larger than 
 * that. 
 *
 * The left and right limits define the x coordinate
 * range to check for overlapping windows. 
 */
function expandVertically(y, left, right, miny, maxy, windows) {

    for (let i = 0; i < windows.length; i++) {
        let rect = windows[i].get_frame_rect();
        
        let wt = rect.y;
        let wb = rect.y + rect.height;
        let wl = rect.x;
        let wr = rect.x + rect.width;

        // Check only  if the window overlaps horizontally
        if(wr > left && wl  < right) {
            if(wb < y && miny < wb) {
                miny = wb;
            }
            if(wt > y && wt < maxy) {
                maxy = wt;
            }
        }
    }

    return {min: miny, max: maxy};
}

/**
 * Resize & move the *window* so it touches adjacent windows or
 * screen edge top, bottom, left and right. The top-left corner 
 * of the window defines the expansion point. 
 *
 * There is an L-ambiguity where the window could be expanded 
 * both vertically and horizontally. The expnasion that results
 * in closer to 1 aspect ratio is selected. 
 */
function snapToNeighbors(display, window, binding) {
    // Unmaximize first
    if (window.maximized_horizontally || window.maximizedVertically)
        window.unmaximize(Meta.MaximizeFlags.HORIZONTAL | Meta.MaximizeFlags.VERTICAL);

    let workArea = window.get_work_area_current_monitor();
    let myrect = window.get_frame_rect();

    let windows = getWindowsOnActiveWorkspace();

    // Scan for overlapping windows in a thin bar around the top of the 
    // window. The vertical height of the window will be adjusted later. 
    let maxHorizw = expandHorizontally(
        myrect.x + Math.min(SCAN_BOX_SIZE, myrect.width / 2), 
        myrect.y + Math.min(SCAN_BOX_SIZE, myrect.height / 2), 
        myrect.y + Math.min(SCAN_BOX_SIZE, myrect.height / 2) + SCAN_BOX_SIZE,
        workArea.x, 
        workArea.x + workArea.width,
        windows
    );

    let maxHorizh = expandVertically(
        myrect.y + Math.min(SCAN_BOX_SIZE, myrect.height / 2),
        maxHorizw.min + OVERLAP_TOLERANCE,
        maxHorizw.max - OVERLAP_TOLERANCE, 
        workArea.y, 
        workArea.y + workArea.height,
        windows)

    let maxVerth = expandVertically(
        myrect.y + Math.min(SCAN_BOX_SIZE, myrect.height / 2),
        myrect.x + Math.min(SCAN_BOX_SIZE, myrect.width / 2), 
        myrect.x + Math.min(SCAN_BOX_SIZE, myrect.width / 2) + SCAN_BOX_SIZE, 
        workArea.y, 
        workArea.y + workArea.height,
        windows)

    let maxVertw = expandHorizontally(
        myrect.x + Math.min(SCAN_BOX_SIZE, myrect.width / 2),
        maxVerth.min + OVERLAP_TOLERANCE, 
        maxVerth.max - OVERLAP_TOLERANCE, 
        workArea.x,
        workArea.x + workArea.width, 
        windows);

    if ((maxHorizw.max - maxHorizw.min) * (maxHorizh.max - maxHorizh.min) > 
        (maxVertw.max - maxVertw.min) * (maxVerth.max - maxVerth.min)) {
        window.move_resize_frame(
            true,
            maxHorizw.min,
            maxHorizh.min, 
            maxHorizw.max - maxHorizw.min, 
            maxHorizh.max - maxHorizh.min
        );
    } else {
        window.move_resize_frame(
            true,
            maxVertw.min,
            maxVerth.min, 
            maxVertw.max - maxVertw.min, 
            maxVerth.max - maxVerth.min
        );
    }
}

function init() {
}

function enable() {
    Main.wm.addKeybinding('snap-to-neighbors',
                          Convenience.getSettings(),
                          Meta.KeyBindingFlags.PER_WINDOW,
                          Shell.ActionMode.NORMAL,
                          snapToNeighbors);
}

function disable() {
    Main.wm.removeKeybinding('snap-to-neighbors');
}

