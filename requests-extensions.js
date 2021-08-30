// ==UserScript==
// @name        ptp-requests-extensions
// @version     0.1
// @include     /^https?://(www\.)?passthepopcorn\.(me)\/requests.php/
// @include     /^https?://(www\.)?passthepopcorn\.(me)\/user.php\?id=/
// @include     /^https?://(www\.)?passthepopcorn\.(me)\/torrents.php\?id=/
// @require     https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==



/*
Configuration stuff
*/
var size_mappings = {};
var time_mappings = {};
var ptp_reqs_config_fields = {
    'MiB': // This is the id of the field
    {
        'section':'Color definitions',
        'label': 'MiB color', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '#ff0000' // Default value if user doesn't change it
    },
    'GiB': // This is the id of the field
    {
        'label': 'GiB color', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '#2a8aed' // Default value if user doesn't change it
    },
    'TiB': // This is the id of the field
    {
        'label': 'TiB color', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '#00ff00' // Default value if user doesn't change it
    },
    'under-month': // This is the id of the field
    {
        'label': 'Created within the month color', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '#00ff00' // Default value if user doesn't change it
    },
    'under-year': // This is the id of the field
    {
        'label': 'Created within the year color', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '#2a8aed' // Default value if user doesn't change it
    },
    'over-year': // This is the id of the field
    {
        'label': 'Created beyond a year color', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '#ff0000' // Default value if user doesn't change it
    },
    'filled-color': // This is the id of the field
    {
        'label': 'Color for the filled column', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '#c8af4b' // Default value if user doesn't change it
    },
    'gp-color': // This is the id of the field
    {
        'label': 'Color for the Golden Popcorns', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '#c8af4b' // Default value if user doesn't change it
    },'any-source-color': // This is the id of the field
    {
        'label': 'Color for the any source', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '#2a8aed' // Default value if user doesn't change it
    },'any-resolution-color': // This is the id of the field
    {
        'label': 'Color for any resolution', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '#2a8aed' // Default value if user doesn't change it
    },'any-container-color': // This is the id of the field
    {
        'label': 'Color for any container', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '#2a8aed' // Default value if user doesn't change it
    },'any-codec-color': // This is the id of the field
    {
        'label': 'Color for any codec', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '#2a8aed' // Default value if user doesn't change it
    },'purchasable-color': // This is the id of the field
    {
        'label': 'Color for the Purchasable/link to purchasable', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '#00ff00' // Default value if user doesn't change it
    },'source-exists-color': // This is the id of the field
    {
        'label': 'Color for the Source Exists/link to source', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '#00ff00' // Default value if user doesn't change it
    },
    'vote-override': // This is the id of the field
    {
        'label': 'Override min ratio for votes', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    },
    'vote-new-ratio': // This is the id of the field
    {
        'label': 'Min ratio to vote', // Appears next to field
        'type': 'text', // Makes this setting a text field
        'default': '1.05' // Default value if user doesn't change it
    },
    'time_format_replacement':
    {
        'label': 'Time text replacement. [["original","new"], ... [] = off',
        'type': 'text',
        'default': '[["years","yrs"],["year","yr"],["weeks","wks"], [" ago",""]]'
    }
};
function attach_ptp_reqs_config() {
    var config_linkbox_link = document.createElement('a');
    config_linkbox_link.innerHTML = 'Requests Config';
    config_linkbox_link.addEventListener("click", function(){GM_config.open()});
    var config_linkbox=document.getElementsByClassName('linkbox')[1];
    config_linkbox.append('[');
    config_linkbox.appendChild(config_linkbox_link);
    config_linkbox.append('] ');
}
function init_ptp_reqs_configs() {
    GM_config.init({
        'id': 'ptp_request_config', // The id used for this instance of GM_config
        'title': 'PTP Request Extensions Configuration',
        'fields': ptp_reqs_config_fields,
        'css': '#MyConfig_section_0 { color: #000000 !important; }'
    });
    size_mappings = {
        'MiB'   : GM_config.get('MiB'),
        'GiB'   : GM_config.get('GiB'),
        'TiB'   : GM_config.get('TiB')
    };
    time_mappings = {
        'year'  : GM_config.get('over-year'),
        'month' : GM_config.get('under-year'),
        ' '     : GM_config.get('under-month')
    };

}
function append_ptp_reqs_configs(new_fields) {
    ptp_reqs_config_fields = Object.assign({}, ptp_reqs_config_fields, new_fields);
}

/*
Utility functions
*/
function replace_time_text(eval, elem) {
    if (!eval) return;
    var replacements = JSON.parse(GM_config.get('time_format_replacement'));
    var elem_html = elem.innerHTML;
    for (let index = 0; index < replacements.length; index++) {
        const original_string = replacements[index][0];
        const new_string = replacements[index][1];
        elem_html = elem_html.replace(original_string, new_string);
    }
    elem.innerHTML = elem_html;
}

function get_torrent_page(url, callback, args) {
    GM_xmlhttpRequest({
        method: 'get',
        url: url,
        timeout: 5000,
        onload: callback.bind(null, args)
    });
}

function set_color(eval, elem, color) {
    if (eval) {
        elem.style.color = color;
    }
}

function set_bold(eval, elem) {
    if (eval) {
        var new_elem = document.createElement('strong');
        new_elem.append(elem.innerText);
        elem.innerText = '';
        elem.appendChild(new_elem);
    }
}

function format_time(eval, elem) {
    if (eval) {
        elem.innerText = elem.innerText.replace(' and', ',');
    }
}

function resolve_color(text) {
    if (text == 'filled') {
        return GM_config.get('filled-color');
    }
    for (const [key, val] of Object.entries(size_mappings)) {
        if (text.indexOf(key) != -1) {
            return val;
        }
    }

    for (const [key, val] of Object.entries(time_mappings)) {
        if (text.indexOf(key) != -1) {
            return val;
        }
    }
    console.log(text);
}
/*
request.php list view modifications
*/
append_ptp_reqs_configs({
    'rlv-fix-source-exists-color': // This is the id of the field
    {
        'section':'List view configuration',
        'label': 'List view: Changes color of (Source Exists)', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    },
    'rlv-fix-purchasable-color': // This is the id of the field
    {
        'label': 'List view: Changes color of Purchasable', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    },
    'rlv-fix-bounty-color': // This is the id of the field
    {
        'label': 'List view: Changes color of bounty sizes', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    },
    'rlv-fix-filled-color': // This is the id of the field
    {
        'label': 'List view: Changes color of Filled column', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    },
    'rlv-fix-created-color': // This is the id of the field
    {
        'label': 'List view: Changes color of Created date column', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    },
    'rlv-fix-filled-date-format': // This is the id of the field
    {
        'label': 'List view: Changes date format of filled column', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    },
    'rlv-fix-created-date-format': // This is the id of the field
    {
        'label': 'List view: Changes date format of created column', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    },
    'rlv-fix-last-vote-date-format': // This is the id of the field
    {
        'label': 'List view: Changes date format of last vote column', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    },
    'rlv-fix-bounty-bold': // This is the id of the field
    {
        'label': 'List view: Changes bounty text to bold', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    },
    'rlv-fix-gp-color': // This is the id of the field
    {
        'label': 'Color golden popcorns', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    }
});
function rlv_fix_name_column_color(elem) {
    var html = elem.innerHTML;
    html = html.replace('(Source Exists)', '<span style="color:' + GM_config.get('source-exists-color') + '">(Source Exists)</span>');
    html = html.replace('Purchasable', '<span style="color:' + GM_config.get('purchasable-color') + '">Purchasable</span>');
    html = html.replace('Any Codec', '<span style="color:' + GM_config.get('any-codec-color') + '">Any Codec</span>');
    html = html.replace('Any Resolution', '<span style="color:' + GM_config.get('any-resolution-color') + '">Any Resolution</span>');
    html = html.replace('Any Source', '<span style="color:' + GM_config.get('any-source-color') + '">Any Source</span>');
    elem.innerHTML = html;
}
function rlv_get_column_index() {
    var row_header = document.getElementById('request_table').getElementsByTagName('thead')[0].getElementsByTagName('th');
    var name_col = -1;
    var bounty_col = 1;
    var created_col = -1;
    var filled_col = -1;
    var last_vote_col = -1;
    for (var rhi = 0; rhi < row_header.length; rhi++){
        if (row_header[rhi].innerText == 'Bounty') {
            bounty_col = rhi;
        }
        if (row_header[rhi].innerText == 'Created') {
            created_col = rhi;
        }
        if (row_header[rhi].innerText.indexOf('Name') != -1) {
            name_col = rhi;
        }
        if (row_header[rhi].innerText == 'Filled') {
            filled_col = rhi;
        }
        if (row_header[rhi].innerText.indexOf('Last Vote') != -1) {
            last_vote_col = rhi;
        }
    }
    return {
        'name'      : name_col,
        'bounty'    : bounty_col,
        'created'   : created_col,
        'filled'    : filled_col,
        'last_vote' : last_vote_col,
    }
}
var column_index;

function fix_list_row(row) {
    var row_cells = row.getElementsByTagName('td');
    if (column_index.bounty != -1){
        set_color(
            GM_config.get('rlv-fix-bounty-color'),
            row_cells[column_index.bounty],
            resolve_color(row_cells[column_index.bounty].innerText)
        );
        set_bold(
            GM_config.get('rlv-fix-bounty-bold'),
            row_cells[column_index.bounty]
        );
    }
    if (column_index.name       != -1){
        rlv_fix_name_column_color(row_cells[column_index.name]);
        set_color(
            GM_config.get('rlv-fix-gp-color') && row_cells[column_index.name].getElementsByClassName('tags')[0].getElementsByClassName('golden-popcorn-character').length == 1,
            row_cells[column_index.name].getElementsByClassName('tags')[0].getElementsByClassName('golden-popcorn-character')[0],
            GM_config.get('gp-color')
        );
    }
    if (column_index.created    != -1) {
        
        format_time(
            GM_config.get('rlv-fix-created-date-format'),
            row_cells[column_index.created].children[0]
        );
        set_color(
            GM_config.get('rlv-fix-created-color'),
            row_cells[column_index.created],
            resolve_color(row_cells[column_index.created].innerText)
        );
        replace_time_text(
            true,
            row_cells[column_index.created]
        );
    }
    if (column_index.filled     != -1) {
        // This If the filled cell is "No", it does not have the same elements
        if (row_cells[column_index.filled].innerText != 'No') {
            format_time(
                GM_config.get('rlv-fix-filled-date-format'),
                row_cells[column_index.filled].children[0].children[0].children[0]
            );
            set_color(
                GM_config.get('rlv-fix-filled-color'),
                row_cells[column_index.filled].children[0].children[0].children[0],
                resolve_color('filled')
            );
            replace_time_text(
                true,
                row_cells[column_index.filled].children[0].children[0].children[0]
            );
        }
    }
    if (column_index.last_vote  != -1) {
        format_time(
            GM_config.get('rlv-fix-last-vote-date-format'),
            row_cells[column_index.last_vote].children[0]
        );
        replace_time_text(
            true,
            row_cells[column_index.last_vote].children[0]
        );
    }
}

function fix_list_view() {
    attach_ptp_reqs_config();
    column_index = rlv_get_column_index();
    var table = document.getElementById('request_table');
    var rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for (var ri = 0; ri < rows.length; ri++){
        fix_list_row(rows[ri]);
    }
    table.getElementsByTagName('tbody')[0].addEventListener('DOMNodeInserted', function(event){
        if (event.target.tagName == 'TR') fix_list_row(event.target);
    });
}

/*
request.php record view modifications
*/
append_ptp_reqs_configs({
    'rrv-add-contrib-list': // This is the id of the field
    {
        'section':['Record view configuration'],
        'label': 'Record view: Additional users shown in contribution list', // Appears next to field
        'type': 'int', // Makes this setting a text field
        'default': '5' // Default value if user doesn't change it
    },
    'rrv-remove-vote': // This is the id of the field
    {
        'label': 'Record view: Hides the button for removing your vote', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    },
    'rrv-reverse-comment': // This is the id of the field
    {
        'label': 'Record view: Reverse the comments', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    },
    'rrv-fix-exists-href': // This is the id of the field
    {
        'label': 'Record view: Changes the "Exists" to be descriptive', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    },
    'rrv-fix-movie-info': // This is the id of the field
    {
        'label': 'Record view: Clones the movie info from the torrent page', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    },
    'rrv-fix-bounty-bold': // This is the id of the field
    {
        'label': 'Record view: Makes bounty bold', // Appears next to field
        'type': 'checkbox', // Makes this setting a text field
        'default': 'true' // Default value if user doesn't change it
    }
});
function set_source_exists_text(parent, source_exists_el) {
    parent.children[0].outerHTML = source_exists_el;
    set_color(
        GM_config.get('rlv-fix-source-exists-color'),
        parent.children[0],
        GM_config.get('source-exists-color')
    );
}
function on_uncached_source_exists(key, elem, response) {
    GM_setValue(key, response);
    set_source_exists_text(elem, response);
}
async function rrv_fix_exists_text(eval, elem) {
    if (eval) {
        var href = elem.children[0].href;
        var source_el = await GM_getValue('Source href: ' + href, null);
        if (source_el == null) {
            var data = {};
            data.action = 'preview';
            data.body = href;
            AddAntiCsrfTokenToPostData(data);
            $jq.post(
                "ajax.php",
                AddAntiCsrfTokenToPostData(data),
                function(response){
                    on_uncached_source_exists('Source href: ' + href ,elem, response);
                }
            );
        } else {
            set_source_exists_text(elem, source_el);
        }
    }
}


function replace_movie_details(new_details) {
    document.getElementById('movieinfo').children[1].outerHTML = new_details;
}
function parse_movie_details(response) {
    var temp = document.createElement('template');
    temp.innerHTML = response.trim();
    return temp.content.getElementById('movieinfo').children[1].outerHTML;
}
function on_uncached_movie_details(href, response) {
    var movie_details_el = parse_movie_details(response.response);
    GM_setValue(href, movie_details_el);
    replace_movie_details(movie_details_el);
}
async function rrv_fix_movie_details(eval) {
    if (eval) {
        var title_hrefs = document.getElementsByClassName('page__title')[0].children;
        for (var title_index = 0; title_index < title_hrefs.length; title_index++) {
            if (title_hrefs[title_index].href.indexOf('torrents.php') != -1) {
                var torrent_href = title_hrefs[title_index].href;
                var movie_detail_el = await GM_getValue(torrent_href, null);
                if (movie_detail_el == null) {
                    get_torrent_page(
                        torrent_href,
                        on_uncached_movie_details,
                        torrent_href
                    );
                } else {
                    replace_movie_details(movie_detail_el);
                }
                break;
            }
        }
    }
}


function rrv_fix_remove_vote(eval, elem) {
    if (eval && (elem.innerHTML.indexOf('(-)') != -1)) {
        var vote_parent = elem.getElementsByTagName('span')[0];
        vote_parent.removeChild(vote_parent.getElementsByTagName('a')[0])
    }
}
function rrv_fix_contribution_list(eval) {
    if (!eval) return;
    var contrib_list = document.getElementById('top_contributors').parentElement.parentElement.parentElement.parentNode.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    var stop_at = 4 + parseInt(GM_config.get('rrv-add-contrib-list'));
    if (contrib_list.length-1 < stop_at) {
        stop_at = contrib_list.length-1;
    }
    for (var cli = 5; cli <= stop_at; cli++) {
        contrib_list[cli].classList.remove('hidden');
    }
}

/*
Patch comment reverse side effect:
For comment permalinks, position is off
*/
const comment_permalink_regex = /postid=[0-9]*#post[0-9]*/g;
function fix_comment_reverse_position() {
    // check if we are in a permalink
    var post_id = document.URL.match(comment_permalink_regex);
    if (post_id) {
        var offset = $jq('#' + post_id[0].split('#')[1]).offset();
        console.log(offset);
        window.scrollTo(offset.left, offset.top);
    }
}

function rrv_reverse_comments(eval) {
    if (!eval) return;
    var parent = document.getElementById('request-table').parentElement;
    var page_bottom = parent.getElementsByClassName('pagination pagination--bottom');
    var page_bottom_node = parent.removeChild(page_bottom[0]);
    var comments = parent.getElementsByClassName('forum-post');
    var reply = comments[comments.length-1];
    parent.removeChild(reply);
    var child_list = [];
    for (var ci = comments.length-1; ci >= 0; ci--) {
        var curr_child = comments[ci];
        child_list.push(curr_child);
        parent.removeChild(curr_child);
    }
    for (ci = child_list.length - 1; ci >= 0 ; ci--) {
        parent.appendChild(child_list.shift());
    }
    parent.appendChild(page_bottom_node);
    parent.appendChild(reply);
    fix_comment_reverse_position();
}


function fix_record_view() {
    var table = document.getElementById('request-table');
    var rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for (var row_index = 0; row_index < rows.length; row_index++) {
        var row = rows[row_index].getElementsByTagName('td');
        switch (row[0].innerText) {
            case 'Created':
                set_color(
                    GM_config.get('rlv-fix-created-color'),
                    row[1].children[0],
                    resolve_color(row[1].innerText)
                );
                replace_time_text(
                    true,
                    row[1].children[0]
                );
                break;
            case 'Votes':
                rrv_fix_remove_vote(
                    GM_config.get('rrv-remove-vote'),
                    row[1]
                );
                break;
            case 'Bounty':
                set_color(
                    GM_config.get('rlv-fix-bounty-color'),
                    row[1],
                    resolve_color(row[1].innerText)
                );
                set_bold(
                    GM_config.get('rrv-fix-bounty-bold'),
                    row[1]
                );
                break;
            case 'Source torrent':
                rrv_fix_exists_text(
                    GM_config.get('rrv-fix-exists-href'),
                    row[1]
                );
                set_color(
                    GM_config.get('rlv-fix-source-exists-color'),
                    row[1].children[0],
                    GM_config.get('source-exists-color')
                );
                break;
            case 'Purchasable at':
                set_color(
                    GM_config.get('rlv-fix-purchasable-color'),
                    row[1].children[0],
                    GM_config.get('purchasable-color')
                );
                break;
            case 'Acceptable sources':
                set_color(
                    row[1].innerText == 'Any',
                    row[1],
                    GM_config.get('any-source-color')
                );
                break;
            case 'Acceptable resolutions':
                set_color(
                    row[1].innerText == 'Any',
                    row[1],
                    GM_config.get('any-resolution-color')
                );
                break;
            case 'Acceptable codecs':
                set_color(
                    row[1].innerText == 'Any',
                    row[1],
                    GM_config.get('any-codec-color')
                );
                break;
            case 'Acceptable containers':
                set_color(
                    row[1].innerText == 'Any',
                    row[1],
                    GM_config.get('any-container-color')
                );
                break;
            case 'Filled':
                set_color(
                    true, //if this row populated, there is a link
                    row[1].children[0].children[0],
                    GM_config.get('filled-color')
                );
                break;
            case 'Golden Popcorn only':
                set_color(
                    row[1].innerText == 'Yes',
                    row[1],
                    GM_config.get('gp-color')
                );
                break;
            case 'Last vote':
                replace_time_text(
                    true,
                    row[1]
                );
                break;
        }

    }
    rrv_fix_movie_details(GM_config.get('rrv-fix-movie-info'))
    rrv_fix_contribution_list(GM_config.get('rrv-add-contrib-list'));
    rrv_reverse_comments(GM_config.get('rrv-reverse-comment'))
    // vote functionality


}
/*
torrents.php record view modifications
*/
append_ptp_reqs_configs({
    'trv-fix-bounty-color':
    {
        'section':'Torrent record view configuration',
        'label': 'Change color of bounty',
        'type': 'checkbox',
        'default': 'true'
    },'trv-fix-bounty-bold':
    {
        'label': 'Make bounty text bold',
        'type': 'checkbox',
        'default': 'true'
    },'trv-fix-created-date-color':
    {
        'label': 'Change color of created date',
        'type': 'checkbox',
        'default': 'true'
    },'trv-fix-created-date-format':
    {
        'label': 'Change date format for created date',
        'type': 'checkbox',
        'default': 'true'
    },'trv-fix-gp-color':
    {
        'label': 'Change color of Golden Popcorn',
        'type': 'checkbox',
        'default': 'true'
    }
});


function fix_torrent_record_view() {
    var table = document.getElementById('requests');
    if (table == null) return;
    var rows = table.children[1].children;
    for (var row_index = 0; row_index < rows.length; row_index++) {
        var row = rows[row_index];
        var cells = row.getElementsByTagName('td');  
        set_color(
            GM_config.get('trv-fix-gp-color') && cells[0].children[0].children.length != 0,
            cells[0].children[0].children[0],
            GM_config.get('gp-color')
        );
        rlv_fix_name_column_color(cells[0]);
        set_color(
            GM_config.get('trv-fix-bounty-color'),
            cells[2],
            resolve_color(cells[2].innerText)
        );
        set_bold(
            GM_config.get('trv-fix-bounty-bold'),
            cells[2],
            resolve_color(cells[2].innerText)
        );
        set_color(
            GM_config.get('trv-fix-created-date-color'),
            cells[3].children[0],
            resolve_color(cells[3].innerText)
        );
        format_time(
            GM_config.get('trv-fix-created-date-format'),
            cells[3].children[0],
            GM_config.get('gp-color')
        );
        replace_time_text(
            true,
            cells[3].children[0]
        );
    }
}

/*
user.php record view modifications
*/
append_ptp_reqs_configs({
    'urv-fix-bounty-color':
    {
        'section':'User record view configuration',
        'label': 'Change color of bounty',
        'type': 'checkbox',
        'default': 'true'
    },'urv-fix-bounty-bold':
    {
        'label': 'Make bounty text bold',
        'type': 'checkbox',
        'default': 'true'
    },'urv-fix-created-date-color':
    {
        'label': 'Change color of created date',
        'type': 'checkbox',
        'default': 'true'
    },'urv-fix-created-date-format':
    {
        'label': 'Change date format for created date',
        'type': 'checkbox',
        'default': 'true'
    },'urv-fix-gp-color':
    {
        'label': 'Change color of Golden Popcorn',
        'type': 'checkbox',
        'default': 'true'
    }
});
function fix_user_record_view() {
    var table = document.getElementById('general').getElementsByClassName('table')[0];
    if (table == null) return;
    if (table.innerText.indexOf('Requests') == -1) return;
    var rows = table.children[1].children;
    for (var row_index = 0; row_index < rows.length; row_index++) {
        var row = rows[row_index];
        var cells = row.getElementsByTagName('td');
        set_color(
            GM_config.get('urv-fix-gp-color') && cells[0].innerHTML.indexOf('golden-popcorn-character') != -1,
            cells[0].getElementsByClassName('tags')[0].children[0],
            GM_config.get('gp-color')
        );
        rlv_fix_name_column_color(cells[0]);
        set_color(
            GM_config.get('urv-fix-bounty-color'),
            cells[2],
            resolve_color(cells[2].innerText)
        );
        set_bold(
            GM_config.get('urv-fix-bounty-bold'),
            cells[2],
            resolve_color(cells[2].innerText)
        );
        set_color(
            GM_config.get('urv-fix-created-date-color'),
            cells[3].children[0],
            resolve_color(cells[3].innerText)
        );
        format_time(
            GM_config.get('urv-fix-created-date-format'),
            cells[3].children[0],
            GM_config.get('gp-color')
        );
        replace_time_text(
            true,
            cells[3].children[0]
        );
    }
}

const app_parser = /([a-zA-Z]*).php/;
const action_parser = /action=([a-zA-Z]*)/;
const id_parser = /(?<!(post)|(thread))id=([0-9]*)/;
const comment_parser = /postid=([0-9]*)/;

// Decides which script to run, depending on the current view
(function() {
    init_ptp_reqs_configs();
    var app = document.URL.match(app_parser) || [];
    var record_id = document.URL.match(id_parser);
    var action = document.URL.match(action_parser) || [];
    var comment_parser = document.URL.match(comment_parser) || [];
    switch (app[1]) {
        case 'requests':
            if (action[1] == 'new') {
                break;
            }
            if (record_id == null) {
                fix_list_view();
            } else {
                fix_record_view();
            }
            break;
        case 'torrents':
            fix_torrent_record_view();
            break;
        case 'user':
            fix_user_record_view();
            break;
        case 'log':
            break;
    }
})();


/*
Patch the minimum ratio
*/
function Calc_2()
{
	var bountyAmount = GetRequestBountyAmount();
	$( '#amount' ).raw().value = bountyAmount;
	$( '#new_bounty' ).raw().innerHTML = get_size( bountyAmount );

	var newUploaded = $( '#current_uploaded' ).raw().value - bountyAmount;
	if ( newUploaded < 0 )
		newUploaded = 0;

	$( '#new_uploaded' ).raw().innerHTML = get_size( newUploaded );
	$jq( "#new_uploaded" ).removeClass();
	if ( newUploaded <= 0 )
		$jq( "#new_uploaded" ).addClass( get_ratio_color( 0 ) );

	$( '#new_ratio' ).raw().innerHTML = ratio( newUploaded, $( '#current_downloaded' ).raw().value );

	var minimumBounty = $( '#minimum_bounty' ).raw().value;
    var below_user_ratio = (parseFloat($( '#new_ratio' ).raw().innerText) < parseFloat(GM_config.get('vote-new-ratio')));
    var disable = (bountyAmount < minimumBounty || newUploaded <= 0) || below_user_ratio;
	$( '#button' ).raw().disabled = disable;
    document.getElementById('user_ratio_text').hidden = !below_user_ratio;
}
var new_max_ratio = parseFloat(GM_config.get('vote-new-ratio'));
if (
    GM_config.get('vote-override')
    && new_max_ratio > 0.65
    && document.getElementById('button') != null
) {
    Calculate = Calc_2;
    var user_ratio_text = document.createElement('span');
    user_ratio_text.hidden = true;
    user_ratio_text.innerText = "Ratio is below user-set threshold: " + GM_config.get('vote-new-ratio');
    user_ratio_text.style.color = '#ff0000';
    user_ratio_text.id = 'user_ratio_text';
    document.getElementById('button').parentElement.appendChild(user_ratio_text);
    jQuery._data($jq("#amount_box")[0], "events").input[0].handler = Calculate;
}