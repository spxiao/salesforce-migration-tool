$(document).ready(function() {

  $("#submitBtn").click(function() {
    if (orgId == null) {
      // new
      $("#inputMethod").val("post");
      $.post('/admin/organization/', $("form").serialize(), function(result) {
        if (result.success) {
          window.location.href = "/admin/organization";
        } else {
          alert("create failed");
        }
      });
    } else {
      // edit
      $("#inputMethod").val("put");
      $.post('/admin/organization/' + orgId, $("form").serialize(), function(result) {
        if (result.success) {
          window.location.href = "/admin/organization/" + orgId;
        } else {
          alert("update failed");
        }
      });
    }
  });

  $("#cancelBtn").click(function() {
    if (orgId == null) {
      // new
      window.location.href = "/admin/organization";
    } else {
      // edit
      window.location.href = "/admin/organization/" + orgId;
    }
  });

});