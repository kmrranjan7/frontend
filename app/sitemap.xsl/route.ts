const XSL = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <xsl:output method="html" encoding="UTF-8"/>
  <xsl:template match="/">
    <html><head><title>XML Sitemap</title><meta name="robots" content="noindex,follow"/>
      <style>body{font-family:Arial,sans-serif;color:#333;margin:40px auto;max-width:1100px;padding:0 20px}h1{font-size:24px}p{line-height:1.6}a{color:#135e96}table{width:100%;border-collapse:collapse;margin-top:24px}th{background:#f1f3f5;text-align:left}th,td{padding:12px;border-bottom:1px solid #ddd}tr:hover{background:#fafafa}</style>
    </head><body>
      <h1>XML Sitemap</h1>
      <p>Generated for search engines. You can find more information about XML sitemaps on <a href="https://www.sitemaps.org/">sitemaps.org</a>.</p>
      <xsl:choose>
        <xsl:when test="s:sitemapindex">
          <p>This XML Sitemap Index file contains <xsl:value-of select="count(s:sitemapindex/s:sitemap)"/> sitemaps.</p>
          <table><tr><th>Sitemap</th><th>Last Modified</th></tr><xsl:for-each select="s:sitemapindex/s:sitemap"><tr><td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td><td><xsl:value-of select="s:lastmod"/></td></tr></xsl:for-each></table>
        </xsl:when>
        <xsl:otherwise>
          <p>This XML Sitemap contains <xsl:value-of select="count(s:urlset/s:url)"/> URLs.</p>
          <table><tr><th>URL</th><th>Images</th><th>Last Mod.</th></tr><xsl:for-each select="s:urlset/s:url"><tr><td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td><td><xsl:value-of select="count(image:image)"/></td><td><xsl:value-of select="s:lastmod"/></td></tr></xsl:for-each></table>
        </xsl:otherwise>
      </xsl:choose>
    </body></html>
  </xsl:template>
</xsl:stylesheet>`;

export function GET(): Response {
  return new Response(XSL, {
    headers: {
      "Content-Type": "application/xslt+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300, must-revalidate",
    },
  });
}
