package com.example.hufs4;

import android.content.Context;
import android.widget.ArrayAdapter;
import android.widget.Filter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class HashTagSuggestAdapter extends ArrayAdapter<String> {

    private HashTagFilter filter;
    private List<String> objects;
    private List<String> suggests = new ArrayList<>();

    private CursorPositionListener listener;

    public HashTagSuggestAdapter(Context context, int resource, String[] objects) {
        super(context,resource,objects);
        this.objects = Arrays.asList(objects);
    }

    public interface CursorPositionListener {
        int currentCursorPosition();
    }

    public void setCursorPositionListener(CursorPositionListener listener) {
        this.listener = listener;
    }

    @Override
    public int getCount() {
        return suggests.size();
    }

    @Override
    public String getItem(int position) {
        return suggests.get(position);
    }

    @Override
    public Filter getFilter() {
        if (filter == null) {
            filter = new HashTagFilter();
        }
        return filter;
    }

    public class HashTagFilter extends Filter {

        private final Pattern pattern = Pattern.compile("[##]([ㄱ-ㅎ 가-힣 0-9 Ａ-Ｚａ-ｚ A-Z a-z一-\u9FC60-9０-９ぁ-ヶｦ-ﾟー])+");

        public int start;
        public int end;

        @Override
        public CharSequence convertResultToString(Object resultValue) {
            return  resultValue.toString() + " #";
        }

        // TextView를 통해 입력받은 text를 파싱하여 자동완성 추천 문구목록을 만들어 리턴하고 자동완성 popup을 띄워준다.
        @Override
        protected FilterResults performFiltering(CharSequence constraint) {

            FilterResults filterResults = new FilterResults();

            suggests.clear();

            int cursorPosition = listener.currentCursorPosition();

            Matcher m = pattern.matcher(constraint.toString());
            while (m.find()) {

                if (m.start() < cursorPosition && cursorPosition <= m.end()) {

                    start = m.start();
                    end = m.end();

                    String tag = constraint.subSequence(m.start(), m.end()).toString();

                    for (int i = 0; i < objects.size(); i++) {

                        String keyword = objects.get(i);
                        if (keyword.toLowerCase().startsWith(tag)) {
                            suggests.add(keyword);

                        }
                    }
                }
            }
            filterResults.values = suggests;
            filterResults.count = suggests.size();
            return filterResults;
        }

        @Override
        protected void publishResults(CharSequence constraint, FilterResults results) {
            if (results != null && results.count > 0) {
                notifyDataSetChanged();
            } else {
                notifyDataSetInvalidated();
            }
        }
    }
}